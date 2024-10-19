import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet, Alert, TouchableOpacity, Modal, ScrollView,ImageBackground } from 'react-native';
import Icon from "react-native-vector-icons/Ionicons";
import { db, auth } from '../firebaseConfig'; // Adjust the path if necessary
import { collection, query, where, onSnapshot, updateDoc, doc, addDoc, getDoc, setDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth'; // Import signOut function

const PrincipalDashboard = ({ navigation }) => {
  const [leaveApplications, setLeaveApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  const isMeetingNotificationCleared = async (userId, meetingId) => {
    const clearedRef = doc(db, "clearedMeetingNotifications", `${userId}_${meetingId}`);
    const clearedDoc = await getDoc(clearedRef);
    return clearedDoc.exists();
  };

  useEffect(() => {
    const fetchLeaveApplications = () => {
      const q = query(collection(db, 'leaveApplications'), where('status', '==', 'approved by HR'));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const applications = [];
        querySnapshot.forEach((doc) => {
          applications.push({ id: doc.id, ...doc.data() });
        });
        setLeaveApplications(applications);
      });

      return () => unsubscribe(); // Cleanup subscription on unmount
    };

    const fetchNotifications = async () => {
      const userId = auth.currentUser.uid; // Get the current user's ID

      // Fetch all meetings
      const meetingQuery = query(collection(db, "meetings"));

      const unsubscribeMeeting = onSnapshot(meetingQuery, async (querySnapshot) => {
        const meetingNotifications = [];
        for (const doc of querySnapshot.docs) {
          const meetingData = doc.data();
          const isCleared = await isMeetingNotificationCleared(userId, doc.id);
          if (!isCleared) {
            meetingNotifications.push({
              id: doc.id,
              type: 'meeting',
              message: `New meeting scheduled: ${meetingData.subject} on ${meetingData.date} at ${meetingData.time}. Location: ${meetingData.location}.`,
              ...meetingData,
              isCleared: false // Add isCleared field
            });
          }
        }
        setNotifications((prev) => [...prev.filter(n => n.type !== 'meeting'), ...meetingNotifications]);
      });

      return () => {
        unsubscribeMeeting();
      }; // Cleanup subscriptions on unmount
    };

    fetchLeaveApplications();
    fetchNotifications();
  }, []);

  const handleApproval = async (applicationId) => {
    try {
      const applicationRef = doc(db, 'leaveApplications', applicationId);
      const applicationSnapshot = await getDoc(applicationRef);
      const applicationData = applicationSnapshot.data();

      await updateDoc(applicationRef, {
        status: 'fully approved', // Update to 'fully approved' when Principal approves
        reviewHistory: [...applicationData.reviewHistory, 'Principal approved'], // Update review history
      });

      // Create a notification in the 'notifications' collection
      await addDoc(collection(db, 'notifications'), {
        facultyId: applicationData.facultyId,
        message: 'Your leave application has been fully approved by HOD, HR, and Principal.',
        isCleared: false, // Add this line
        createdAt: new Date(), // Add timestamp
      });

      Alert.alert('Success', 'Leave application fully approved!');
    } catch (error) {
      console.error('Error approving leave application:', error);
      Alert.alert('Error', 'Failed to approve leave application.');
    }
  };

  const handleRejection = async (applicationId) => {
    try {
      const applicationRef = doc(db, 'leaveApplications', applicationId);
      const applicationSnapshot = await getDoc(applicationRef);
      const applicationData = applicationSnapshot.data();

      await updateDoc(applicationRef, {
        status: 'rejected', // Update to 'rejected' when Principal rejects
        reviewHistory: [...applicationData.reviewHistory, 'Principal rejected'], // Update review history
      });

      // Create a notification in the 'notifications' collection
      await addDoc(collection(db, 'notifications'), {
        facultyId: applicationData.facultyId,
        message: 'Your leave application has been rejected by the Principal.',
        isCleared: false, // Add this line
        createdAt: new Date(), // Add timestamp
      });

      Alert.alert('Success', 'Leave application rejected!');
    } catch (error) {
      console.error('Error rejecting leave application:', error);
      Alert.alert('Error', 'Failed to reject leave application.');
    }
  };

  const handleNotificationPress = () => {
    setModalVisible(true); // Show the modal when notifications icon is pressed
  };

  const clearNotifications = async () => {
    try {
      const userId = auth.currentUser.uid; // Get the current user's ID
      const meetingNotifications = notifications.filter(n => n.type === 'meeting');
      for (const notification of meetingNotifications) {
        const clearedRef = doc(db, "clearedMeetingNotifications", `${userId}_${notification.id}`);
        await setDoc(clearedRef, { clearedAt: new Date() }); // Mark notification as cleared
      }
      setNotifications([]); // Clear notifications from the UI
      Alert.alert("Notifications cleared from view!"); // Notify user
    } catch (error) {
      console.error("Error clearing notifications:", error);
      Alert.alert("Error", "Failed to clear notifications.");
    }
  };

  // Sign out function
  const handleSignOut = async () => {
    try {
      await signOut(auth); // Sign the user out
      navigation.navigate('SignInScreen'); // Navigate back to SignIn screen
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out.');
    }
  };

  return (

    <ImageBackground
      source={require('../assets/facultydash.jpeg')}
      style={styles.backgroundImage}
    >
    <View style={styles.container}>
      <Text style={styles.title}>Leave Applications for Principal Approval</Text>
      <TouchableOpacity
        onPress={handleNotificationPress}
        style={styles.notificationIcon}
      >
        <Icon name="notifications-outline" size={30} color="#000" />
        {notifications.length > 0 && (
          <View style={styles.notificationBadge}>
            <Text style={styles.badgeText}>{notifications.length}</Text>
          </View>
        )}
      </TouchableOpacity>
      <FlatList
        data={leaveApplications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.application}>
            <Text>Faculty ID: {item.facultyId}</Text>
            <Text>Faculty Name: {item.facultyName}</Text>

            {/* Handle null values for leaveDates */}
            <Text>
              Leave From: {item.leaveDates?.from ? item.leaveDates.from.toDate().toLocaleDateString() : 'N/A'}
            </Text>
            <Text>
              Leave To: {item.leaveDates?.to ? item.leaveDates.to.toDate().toLocaleDateString() : 'N/A'}
            </Text>

            <Text>Reason: {item.reason}</Text>
            <Button title="Approve" onPress={() => handleApproval(item.id)} />
            <Button title="Reject" onPress={() => handleRejection(item.id)} />
          </View>
        )}
      />

      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("PrincipalDashboard")}>
          <Icon name="home-outline" size={24} color="#000" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("MeetingSetup")}>
          <Icon name="calendar-outline" size={24} color="#000" />
          <Text style={styles.navText}>Meetings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("AdminTimetable")}>
          <Icon name="checkmark-outline" size={24} color="#000" />
          <Text style={styles.navText}>Schedule</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Settings")}>
          <Icon name="settings-outline" size={24} color="#000" />
          <Text style={styles.navText}>Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={handleSignOut}>
          <Icon name="log-out-outline" size={24} color="#000" />
          <Text style={styles.navText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Modal for displaying notifications */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeIcon}
              onPress={() => setModalVisible(false)}
            >
              <Icon name="close" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Meeting Notifications</Text>
            <ScrollView style={styles.notificationList}>
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <View key={n.id} style={styles.notification}>
                    <Text style={styles.notificationText}>{n.subject}</Text>
                    <Text>Date: {n.date}</Text>
                    <Text>Time: {n.time}</Text>
                    <Text>Organizer: {n.organizerRole}</Text>
                    <Text>Location: {n.location}</Text>
                  </View>
                ))
              ) : (
                <Text>No new notifications</Text>
              )}
              {notifications.length > 0 && (
                <Button
                  title="Clear Notifications"
                  onPress={clearNotifications}
                />
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  application: {
    marginBottom: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  notificationIcon: {
    position: "absolute",
    top: 20,
    right: 20,
  },
  notificationBadge: {
    position: "absolute",
    right: 0,
    top: -5,
    backgroundColor: "red",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 12,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    width: '110%',
    position: 'absolute',
    bottom: 0,
  },
  navItem: {
    alignItems: 'center',
    padding: 10,
  },
  navText: {
    color: '#000',
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
  },
  modalContent: {
    width: "80%",
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  closeIcon: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  notification: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginVertical: 5,
  },
  notificationText: {
    fontSize: 16,
  },
  notificationList: {
    width: '100%',
  },
});

export default PrincipalDashboard;