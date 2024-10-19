import React, { useEffect, useState } from "react";
import {View,Text,StyleSheet,Alert,TouchableOpacity,Modal,ScrollView,ImageBackground,ActivityIndicator} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { db, auth } from "../firebaseConfig";
import {collection,onSnapshot,query,where,updateDoc,doc,getDocs,getDoc,setDoc} from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";

const FacultyDashboard = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [casualLeavesTaken, setCasualLeavesTaken] = useState(0);
  const [medicalLeavesTaken, setMedicalLeavesTaken] = useState(0);
  const [maternityLeavesTaken, setMaternityLeavesTaken] = useState(0);
  const [facultyName, setFacultyName] = useState("");
  const [loading, setLoading] = useState(true); // State for loading
  const [currentUser, setCurrentUser] = useState(null); // To hold the current user

  const isMeetingNotificationCleared = async (facultyId, meetingId) => {
    const clearedRef = doc(
      db,
      "clearedMeetingNotifications",
      `${facultyId}_${meetingId}`
    );
    const clearedDoc = await getDoc(clearedRef);
    return clearedDoc.exists();
  };

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        fetchNotifications(user.uid);
        fetchLeavesData(user.uid);
      } else {
        navigation.navigate("SignInScreen"); // Navigate to sign-in if no user is logged in
      }
    });

    return () => unsubscribeAuth(); // Clean up the listener on component unmount
  }, []);

  const fetchNotifications = (facultyId) => {
    // Fetch leave notifications
    const leaveQuery = query(
      collection(db, "notifications"),
      where("facultyId", "==", facultyId),
      where("isCleared", "!=", true)
    );

    // Fetch all meetings
    const meetingQuery = query(collection(db, "meetings"));

    const unsubscribeLeave = onSnapshot(leaveQuery, (querySnapshot) => {
      const leaveNotifications = [];
      querySnapshot.forEach((doc) => {
        leaveNotifications.push({ id: doc.id, type: "leave", ...doc.data() });
      });
      setNotifications((prev) => [
        ...prev.filter((n) => n.type !== "leave"),
        ...leaveNotifications,
      ]);
    });

    const unsubscribeMeeting = onSnapshot(meetingQuery, async (querySnapshot) => {
      const meetingNotifications = [];
      for (const doc of querySnapshot.docs) {
        const meetingData = doc.data();
        const isCleared = await isMeetingNotificationCleared(facultyId, doc.id);
        if (!isCleared) {
          meetingNotifications.push({
            id: doc.id,
            type: "meeting",
            message: `New meeting scheduled: ${meetingData.subject} on ${meetingData.date} at ${meetingData.time}. Location: ${meetingData.location}.`,
            ...meetingData,
          });
        }
      }
      setNotifications((prev) => [
        ...prev.filter((n) => n.type !== "meeting"),
        ...meetingNotifications,
      ]);
    });

    return () => {
      unsubscribeLeave();
      unsubscribeMeeting();
    };
  };

  const fetchLeavesData = async (facultyId) => {
    try {
      const userDoc = await getDoc(doc(db, "users", facultyId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setCasualLeavesTaken(userData.totalCasualLeavesTaken || 0);
        setMedicalLeavesTaken(userData.totalMedicalLeavesTaken || 0);
        setMaternityLeavesTaken(userData.totalMaternityLeavesTaken || 0);
        setFacultyName(userData.name || "");
      }
      setLoading(false); // Data has been fetched, stop loading
    } catch (error) {
      console.error("Error fetching leaves data:", error);
      setLoading(false);
    }
  };

  const handleNotificationPress = () => {
    setModalVisible(true);
  };

  const clearNotifications = async () => {
    try {
      const facultyId = currentUser.uid;

      // Clear leave notifications
      const leaveQuery = query(
        collection(db, "notifications"),
        where("facultyId", "==", facultyId)
      );
      const leaveSnapshot = await getDocs(leaveQuery);
      leaveSnapshot.forEach(async (doc) => {
        await updateDoc(doc.ref, { isCleared: true });
      });

      // Clear meeting notifications
      const meetingNotifications = notifications.filter(
        (n) => n.type === "meeting"
      );
      for (const notification of meetingNotifications) {
        const clearedRef = doc(
          db,
          "clearedMeetingNotifications",
          `${facultyId}_${notification.id}`
        );
        await setDoc(clearedRef, { clearedAt: new Date() });
      }

      setNotifications([]);
      Alert.alert("Notifications cleared from view!");
    } catch (error) {
      console.error("Error clearing notifications:", error);
      Alert.alert("Error", "Failed to clear notifications.");
    }
  };

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        navigation.navigate("SignInScreen"); // Navigate to sign-in screen after successful sign-out
      })
      .catch((error) => {
        Alert.alert("Error", "Failed to sign out. Please try again.");
        console.error("Sign-out error:", error);
      });
  };

  // Loading screen until the data is ready
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Loading...</Text>
      </View>
    );
  }

  const leaveNotifications = notifications.filter((n) => n.type === "leave");
  const meetingNotifications = notifications.filter((n) => n.type === "meeting");

  return (
    <ImageBackground 
      source={require("../assets/facultydash.jpeg")} 
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>Welcome, {facultyName}</Text>
          </View>
          <TouchableOpacity
            onPress={handleNotificationPress}
            style={styles.notificationIcon}
          >
            <Icon name="notifications-outline" size={30} color="#fff" />
            {notifications.length > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>{notifications.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.overviewContainer}>
          <Text style={styles.overviewTitle}>Leave Overview</Text>
          <View style={styles.card}>
            <Text style={styles.overviewText}>
              Casual Leaves Taken: {casualLeavesTaken}/15
            </Text>
            <Text style={styles.overviewText}>
              Medical Leaves Taken: {medicalLeavesTaken}/10
            </Text>
            <Text style={styles.overviewText}>
              Maternity Leaves Taken: {maternityLeavesTaken}/1 (days)
            </Text>
          </View>
        </View>

        <View style={styles.applyButtonContainer}>
          <TouchableOpacity
            style={styles.applyButton}
            onPress={() => navigation.navigate("LeaveApplication")}
          >
            <Text style={styles.applyButtonText}>Apply for Leave</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.navBar}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigation.navigate("FacultyDashboard")}
          >
            <Icon name="home-outline" size={24} color="#000" />
            <Text style={styles.navText}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigation.navigate("MeetingTabs")}
          >
            <Icon name="calendar-outline" size={24} color="#000" />
            <Text style={styles.navText}>Meetings</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigation.navigate("FacultyTimetable")}
          >
            <Icon name="checkmark-outline" size={24} color="#000" />
            <Text style={styles.navText}>Schedule</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={handleSignOut}>
            <Icon name="exit-outline" size={24} color="#000" />
            <Text style={styles.navText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <ScrollView style={styles.modalScrollView}>
                <TouchableOpacity
                  style={styles.closeIcon}
                  onPress={() => setModalVisible(false)}
                >
                  <Icon name="close" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Notifications</Text>
                <View style={styles.notificationContainer}>
                  {leaveNotifications.length > 0 && (
                    <View style={styles.notificationSection}>
                      <Text style={styles.sectionTitle}>Leave Notifications</Text>
                      {leaveNotifications.map((n) => (
                        <View key={n.id} style={styles.notification}>
                          <View style={styles.notificationIcon}>
                            <Icon name="document-text-outline" size={24} color="#007bff" />
                          </View>
                          <View style={styles.notificationContent}>
                            <Text style={styles.notificationMessage}>{n.message}</Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                  {meetingNotifications.length > 0 && (
                    <View style={styles.notificationSection}>
                      <Text style={styles.sectionTitle}>Meeting Notifications</Text>
                      {meetingNotifications.map((n) => (
                        <View key={n.id} style={styles.notification}>
                          <View style={styles.notificationIcon}>
                            <Icon name="calendar-outline" size={24} color="#007bff" />
                          </View>
                          <View style={styles.notificationContent}>
                            <Text style={styles.notificationMessage}>{n.subject}</Text>
                            <Text style={styles.notificationDetail}>Date: {n.date}</Text>
                            <Text style={styles.notificationDetail}>Time: {n.time}</Text>
                            <Text style={styles.notificationDetail}>Organizer: {n.organizerRole}</Text>
                            <Text style={styles.notificationDetail}>Location: {n.location}</Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                  {leaveNotifications.length === 0 && meetingNotifications.length === 0 && (
                    <Text style={styles.noNotificationsText}>No new notifications</Text>
                  )}
                </View>
                {(leaveNotifications.length > 0 || meetingNotifications.length > 0) && (
                  <TouchableOpacity
                    style={styles.clearButton}
                    onPress={clearNotifications}
                  >
                    <Text style={styles.clearButtonText}>Clear Notifications</Text>
                  </TouchableOpacity>
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
    backgroundColor: '#e6f7ff', // Light blue background
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(230, 247, 255, 0.1)', // Light blue background with opacity
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#007bff',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  welcomeContainer: {
    backgroundColor: '#007bff', // Blue background
    paddingVertical: 2, // Reduce vertical padding
    paddingHorizontal: 15, // Keep some horizontal padding
    borderRadius: 5,
    marginBottom: 0,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'serif', // Update to your custom font family
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  overviewContainer: {
    flex: 1,
    justifyContent: 'center', // Center the overview vertically
    alignItems: 'center', // Center the overview horizontally
    paddingHorizontal: 24,
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    width: '90%', // Full width for the card
  },
  overviewText: {
    fontSize: 16,
    marginVertical: 5,
  },
  applyButtonContainer: {
    marginBottom: 70, // Space above the navigation bar
    alignItems: 'center',
  },
  applyButton: {
    backgroundColor: '#007bff',
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    height: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginVertical: 15,
    textAlign: "center",
  },
  notification: {
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#dc3545',
    borderRadius: 5,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  notificationIcon: {
    marginRight: 10,
  },
  notificationContent: {
    flex: 1,
  },
  notificationMessage: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  notificationDetail: {
    fontSize: 14,
    color: '#666',
  },
  notificationSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  noNotificationsText: {
    textAlign: 'center',
    color: '#666',
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#D2E0FB',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    width: '100%',
    position: 'absolute',
    bottom: 0,
    elevation: 4,
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    color: '#000',
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
});

export default FacultyDashboard;



// import React, { useEffect, useState } from "react";
// import { View, Text, StyleSheet, Alert, TouchableOpacity, Modal, ScrollView, ImageBackground } from "react-native";
// import Icon from "react-native-vector-icons/Ionicons";
// import { db, auth } from "../firebaseConfig";
// import { collection, onSnapshot, query, where, updateDoc, doc, getDocs, getDoc, setDoc } from "firebase/firestore";
// import { signOut } from "firebase/auth"; 

// const FacultyDashboard = ({ navigation }) => {
//   const [notifications, setNotifications] = useState([]);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [casualLeavesTaken, setCasualLeavesTaken] = useState(0);
//   const [medicalLeavesTaken, setMedicalLeavesTaken] = useState(0);
//   const [maternityLeavesTaken, setMaternityLeavesTaken] = useState(0);
//   const [facultyName, setFacultyName] = useState(""); // State to hold the faculty name

//   const isMeetingNotificationCleared = async (facultyId, meetingId) => {
//     const clearedRef = doc(db, "clearedMeetingNotifications", `${facultyId}_${meetingId}`);
//     const clearedDoc = await getDoc(clearedRef);
//     return clearedDoc.exists();
    
//   };

//   useEffect(() => {
//     const fetchNotifications = () => {
//       const facultyId = auth.currentUser.uid;

//       // Fetch leave notifications
//       const leaveQuery = query(
//         collection(db, "notifications"),
//         where("facultyId", "==", facultyId),
//         where("isCleared", "!=", true)
//       );

//       // Fetch all meetings
//       const meetingQuery = query(collection(db, "meetings"));

//       const unsubscribeLeave = onSnapshot(leaveQuery, (querySnapshot) => {
//         const leaveNotifications = [];
//         querySnapshot.forEach((doc) => {
//           leaveNotifications.push({ id: doc.id, type: 'leave', ...doc.data() });
//         });
//         setNotifications((prev) => [...prev.filter(n => n.type !== 'leave'), ...leaveNotifications]);
//       });

//       const unsubscribeMeeting = onSnapshot(meetingQuery, async (querySnapshot) => {
//         const meetingNotifications = [];
//         for (const doc of querySnapshot.docs) {
//           const meetingData = doc.data();
//           const isCleared = await isMeetingNotificationCleared(facultyId, doc.id);
//           if (!isCleared) {
//             meetingNotifications.push({
//               id: doc.id,
//               type: 'meeting',
//               message: `New meeting scheduled: ${meetingData.subject} on ${meetingData.date} at ${meetingData.time}. Location: ${meetingData.location}.`,
//               ...meetingData
//             });
//           }
//         }
//         setNotifications((prev) => [...prev.filter(n => n.type !== 'meeting'), ...meetingNotifications]);
//       });

//       return () => {
//         unsubscribeLeave();
//         unsubscribeMeeting();
//       };
//     };

//     const fetchLeavesData = async () => {
//       try {
//         const facultyId = auth.currentUser.uid;
//         const userDoc = await getDoc(doc(db, "users", facultyId));
//         if (userDoc.exists()) {
//           const userData = userDoc.data();
//           setCasualLeavesTaken(userData.totalCasualLeavesTaken || 0);
//           setMedicalLeavesTaken(userData.totalMedicalLeavesTaken || 0);
//           setMaternityLeavesTaken(userData.totalMaternityLeavesTaken || 0);
//           setFacultyName(userData.name || ""); // Assuming the user's name is stored under the 'name' field
//         }
//       } catch (error) {
//         console.error("Error fetching leaves data:", error);
//       }
//     };

//     fetchNotifications();
//     fetchLeavesData();
//   }, []);

//   const handleNotificationPress = () => {
//     setModalVisible(true);
//   };

//   const clearNotifications = async () => {
//     try {
//       const facultyId = auth.currentUser.uid;
      
//       // Clear leave notifications
//       const leaveQuery = query(
//         collection(db, "notifications"),
//         where("facultyId", "==", facultyId)
//       );
//       const leaveSnapshot = await getDocs(leaveQuery);
//       leaveSnapshot.forEach(async (doc) => {
//         await updateDoc(doc.ref, { isCleared: true });
//       });

//       // Clear meeting notifications
//       const meetingNotifications = notifications.filter(n => n.type === 'meeting');
//       for (const notification of meetingNotifications) {
//         const clearedRef = doc(db, "clearedMeetingNotifications", `${facultyId}_${notification.id}`);
//         await setDoc(clearedRef, { clearedAt: new Date() });
//       }

//       setNotifications([]);
//       Alert.alert("Notifications cleared from view!");
//     } catch (error) {
//       console.error("Error clearing notifications:", error);
//       Alert.alert("Error", "Failed to clear notifications.");
//     }
//   };
  
  
  

//   const leaveNotifications = notifications.filter(n => n.type === 'leave');
//   const meetingNotifications = notifications.filter(n => n.type === 'meeting');

//   return (
//     <ImageBackground 
//       source={require('../assets/facultydash1.png')} 
//       style={styles.backgroundImage}
//       resizeMode="cover"
//     >
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <View style={styles.welcomeContainer}>
//           <Text style={styles.welcomeText}>Welcome, {facultyName}</Text>
//         </View>
//         <TouchableOpacity
//           onPress={handleNotificationPress}
//           style={styles.notificationIcon}
//         >
          
//           <Icon name="notifications-outline" size={30} color="#fff" />
//           {notifications.length > 0 && (
//             <View style={styles.notificationBadge}>
//               <Text style={styles.badgeText}>{notifications.length}</Text>
//             </View>
//           )}
//         </TouchableOpacity>
//       </View>

//       <View style={styles.overviewContainer}>
//         <Text style={styles.overviewTitle}>Leave Overview</Text>
//         <View style={styles.card}>
//           <Text style={styles.overviewText}>
//             Casual Leaves Taken: {casualLeavesTaken}/15
//           </Text>
//           <Text style={styles.overviewText}>
//             Medical Leaves Taken: {medicalLeavesTaken}/10
//           </Text>
//           <Text style={styles.overviewText}>
//             Maternity Leaves Taken: {maternityLeavesTaken}/180 (days)
//           </Text>
//         </View>
//       </View>

//       <View style={styles.applyButtonContainer}>
//         <TouchableOpacity
//           style={styles.applyButton}
//           onPress={() => navigation.navigate("LeaveApplication")}
//         >
//           <Text style={styles.applyButtonText}>Apply for Leave</Text>
//         </TouchableOpacity>
//       </View>

//       <View style={styles.navBar}>
//         <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("FacultyDashboard")}>
//           <Icon name="home-outline" size={24} color="#000" />
//           <Text style={styles.navText}>Home</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("MeetingTabs")}>
//           <Icon name="calendar-outline" size={24} color="#000" />
//           <Text style={styles.navText}>Meetings</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("FacultyTimetable")}>
//           <Icon name="checkmark-outline" size={24} color="#000" />
//           <Text style={styles.navText}>Schedule</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.navItem} onPress={() => Alert.alert("Sign Out")}>
      
//           <Icon name="log-out-outline" size={24} color="#000" />
//           <Text style={styles.navText}>Sign Out</Text>
//         </TouchableOpacity>
//       </View>

//       <Modal
//         animationType="slide"
//         transparent={true}
//         visible={modalVisible}
//         onRequestClose={() => setModalVisible(false)}
//       >
//         <View style={styles.modalContainer}>
//           <View style={styles.modalContent}>
//             <ScrollView style={styles.modalScrollView}>
//               <TouchableOpacity
//                 style={styles.closeIcon}
//                 onPress={() => setModalVisible(false)}
//               >
//                 <Icon name="close" size={24} color="#000" />
//               </TouchableOpacity>
//               <Text style={styles.modalTitle}>Notifications</Text>
//               <View style={styles.notificationContainer}>
//                 {leaveNotifications.length > 0 && (
//                   <View style={styles.notificationSection}>
//                     <Text style={styles.sectionTitle}>Leave Notifications</Text>
//                     {leaveNotifications.map((n) => (
//                       <View key={n.id} style={styles.notification}>
//                         <View style={styles.notificationIcon}>
//                           <Icon name="document-text-outline" size={24} color="#007bff" />
//                         </View>
//                         <View style={styles.notificationContent}>
//                           <Text style={styles.notificationMessage}>{n.message}</Text>
//                         </View>
//                       </View>
//                     ))}
//                   </View>
//                 )}
//                 {meetingNotifications.length > 0 && (
//                   <View style={styles.notificationSection}>
//                     <Text style={styles.sectionTitle}>Meeting Notifications</Text>
//                     {meetingNotifications.map((n) => (
//                       <View key={n.id} style={styles.notification}>
//                         <View style={styles.notificationIcon}>
//                           <Icon name="calendar-outline" size={24} color="#007bff" />
//                         </View>
//                         <View style={styles.notificationContent}>
//                           <Text style={styles.notificationMessage}>{n.subject}</Text>
//                           <Text style={styles.notificationDetail}>Date: {n.date}</Text>
//                           <Text style={styles.notificationDetail}>Time: {n.time}</Text>
//                           <Text style={styles.notificationDetail}>Organizer: {n.organizerRole}</Text>
//                           <Text style={styles.notificationDetail}>Location: {n.location}</Text>
//                         </View>
//                       </View>
//                     ))}
//                   </View>
//                 )}
//                 {leaveNotifications.length === 0 && meetingNotifications.length === 0 && (
//                   <Text style={styles.noNotificationsText}>No new notifications</Text>
//                 )}
//               </View>
//               {(leaveNotifications.length > 0 || meetingNotifications.length > 0) && (
//                 <TouchableOpacity
//                   style={styles.clearButton}
//                   onPress={clearNotifications}
//                 >
//                   <Text style={styles.clearButtonText}>Clear Notifications</Text>
//                 </TouchableOpacity>
//               )}
//             </ScrollView>
//           </View>
//         </View>
//       </Modal>
//     </View>
//     </ImageBackground>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#e6f7ff', // Light blue background
//   },
//   backgroundImage: {
//     flex: 1,
//     width: '100%',
//     height: '100%',
//   },
//   container: {
//     flex: 1,
//     backgroundColor: 'rgba(230, 247, 255, 0.1)', // Light blue background with opacity
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     backgroundColor: '#007bff',
//     paddingVertical: 16,
//     paddingHorizontal: 24,
//     borderBottomWidth: 1,
//     borderBottomColor: '#ccc',
//   },
//   title: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     color: '#fff',
//   },
//   welcomeContainer: {
//     backgroundColor: '#007bff', // Blue background
//     paddingVertical: 2, // Reduce vertical padding
//     paddingHorizontal: 15, // Keep some horizontal padding
//     borderRadius: 5,
//     marginBottom: 0,
//     alignItems: 'center',
//   },
//   welcomeText: {
//     fontSize: 20,
//     color: '#fff',
//     fontFamily: 'serif', // Update to your custom font family
//     fontWeight: 'bold',
//     fontStyle: 'italic',
//   },
//   overviewContainer: {
//     flex: 1,
//     justifyContent: 'center', // Center the overview vertically
//     alignItems: 'center', // Center the overview horizontally
//     paddingHorizontal: 24,
//   },
//   overviewTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 10,
//   },
//   card: {
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     padding: 15,
//     shadowColor: '#000',
//     shadowOpacity: 0.1,
//     shadowRadius: 5,
//     elevation: 3,
//     width: '90%', // Full width for the card
//   },
//   overviewText: {
//     fontSize: 16,
//     marginVertical: 5,
//   },
//   applyButtonContainer: {
//     marginBottom: 70, // Space above the navigation bar
//     alignItems: 'center',
//   },
//   applyButton: {
//     backgroundColor: '#007bff',
//     borderRadius: 5,
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     alignItems: 'center',
//   },
//   applyButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   modalContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "rgba(0, 0, 0, 0.5)",
//   },
//   modalContent: {
//     width: "90%",
//     height: "80%",
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     padding: 20,
//     shadowColor: '#000',
//     shadowOpacity: 0.2,
//     shadowRadius: 10,
//     elevation: 5,
//   },
//   modalTitle: {
//     fontSize: 22,
//     fontWeight: "bold",
//     marginVertical: 15,
//     textAlign: "center",
//   },
//   notification: {
//     padding: 10,
//     backgroundColor: '#f9f9f9',
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 5,
//     marginVertical: 5,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   clearButton: {
//     backgroundColor: '#dc3545',
//     borderRadius: 5,
//     paddingVertical: 12,
//     alignItems: 'center',
//     marginTop: 10,
//   },
//   clearButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   notificationIcon: {
//     marginRight: 10,
//   },
//   notificationContent: {
//     flex: 1,
//   },
//   notificationMessage: {
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   notificationDetail: {
//     fontSize: 14,
//     color: '#666',
//   },
//   notificationSection: {
//     marginBottom: 20,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     marginBottom: 10,
//   },
//   noNotificationsText: {
//     textAlign: 'center',
//     color: '#666',
//   },
//   navBar: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     alignItems: 'center',
//     backgroundColor: '#D2E0FB',
//     paddingVertical: 10,
//     borderTopWidth: 1,
//     borderTopColor: '#ccc',
//     width: '100%',
//     position: 'absolute',
//     bottom: 0,
//     elevation: 4,
//   },
//   navItem: {
//     alignItems: 'center',
//   },
//   navText: {
//     fontSize: 12,
//     color: '#000',
//   },
//   notificationIcon: {
//     position: "absolute",
//     top: 20,
//     right: 20,
//   },
//   notificationBadge: {
//     position: "absolute",
//     right: 0,
//     top: -5,
//     backgroundColor: "red",
//     borderRadius: 10,
//     width: 20,
//     height: 20,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   badgeText: {
//     color: "white",
//     fontSize: 12,
//   },
// });
// export default FacultyDashboard;