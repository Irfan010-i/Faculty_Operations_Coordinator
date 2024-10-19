import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, TouchableOpacity,ImageBackground } from 'react-native';
import { db } from '../firebaseConfig';
import { addDoc, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { auth } from '../firebaseConfig';
import DateTimePicker from '@react-native-community/datetimepicker';

const MeetingSetup = () => {
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [location, setLocation] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleScheduleMeeting = async () => {
    try {
      const organizerId = auth.currentUser.uid;
      const userDoc = await getDoc(doc(db, 'users', organizerId));
      
      if (!userDoc.exists()) {
        Alert.alert('Error', 'User data not found.');
        return;
      }

      const userData = userDoc.data();
      const organizerRole = userData.role;
      const organizerFacultyId = userData.id;

      // Fetch all faculty members
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const attendees = usersSnapshot.docs.map(doc => doc.id);

      const meetingData = {
        subject,
        date: date.toISOString().slice(0, 10),
        time: time.toLocaleTimeString(),
        location,
        organizerId,
        organizerRole,
        attendees, // Add all faculty members as attendees
        isCleared: false, // Add isCleared field and set it to false initially
      };

      // Store meeting in Firestore
      await addDoc(collection(db, 'meetings'), meetingData);

      // Notify all users
      await notifyUsers(meetingData, organizerFacultyId);

      Alert.alert('Success', 'Meeting scheduled successfully!');
      // Clear fields
      setSubject('');
      setDate(new Date());
      setTime(new Date());
      setLocation('');
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      Alert.alert('Error', 'Failed to schedule meeting.');
    }
  };

  const notifyUsers = async (meetingData, organizerFacultyId) => {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    usersSnapshot.forEach(async (userDoc) => {
      const userData = userDoc.data();
      
      if (userData.id === organizerFacultyId) {
        return;
      }
      
      await addDoc(collection(db, 'notifications'), {
        facultyId: userData.id,
        message: `New meeting scheduled by ${meetingData.organizerRole}: ${meetingData.subject} on ${meetingData.date} at ${meetingData.time}. Location: ${meetingData.location}.`,
        isCleared: false, // Ensure isCleared is set to false for notifications
        createdAt: new Date(),
      });
    });
  };

  const showDateTimePicker = (type) => {
    if (type === 'date') {
      setShowDatePicker(true);
    } else {
      setShowTimePicker(true);
    }
  };

  const onDateTimeChange = (event, selectedDateTime) => {
    const currentDateTime = selectedDateTime || new Date();
    if (showDatePicker) {
      setShowDatePicker(false);
      setDate(currentDateTime);
    } else if (showTimePicker) {
      setShowTimePicker(false);
      setTime(currentDateTime);
    }
  };

  return (
    <ImageBackground
      source={require('../assets/bg1.png')}
      style={styles.backgroundImage}
    >
    <View style={styles.container}>
      <Text style={styles.label}>Meeting Subject:</Text>
      <TextInput
        style={styles.input}
        value={subject}
        onChangeText={setSubject}
      />
      <Text style={styles.label}>Date:</Text>
      <View style={styles.dateTimeContainer}>
        <TextInput
          style={styles.input}
          value={date.toISOString().slice(0, 10)}
          editable={false}
        />
        <TouchableOpacity onPress={() => showDateTimePicker('date')}>
          <Text style={styles.pickerButton}>Select</Text>
        </TouchableOpacity>
      </View>
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onDateTimeChange}
          minimumDate={new Date()}
        />
      )}
      <Text style={styles.label}>Time:</Text>
      <View style={styles.dateTimeContainer}>
        <TextInput
          style={styles.input}
          value={time.toLocaleTimeString()}
          editable={false}
        />
        <TouchableOpacity onPress={() => showDateTimePicker('time')}>
          <Text style={styles.pickerButton}>Select</Text>
        </TouchableOpacity>
      </View>
      {showTimePicker && (
        <DateTimePicker
          value={time}
          mode="time"
          display="default"
          onChange={onDateTimeChange}
        />
      )}
      <Text style={styles.label}>Location:</Text>
      <TextInput
        style={styles.input}
        value={location}
        onChangeText={setLocation}
      />
      <Button title="Schedule Meeting" onPress={handleScheduleMeeting} />
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
  label: {
    marginVertical: 10,
    fontSize: 16,
    color: 'white',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 10,
    marginBottom: 10,
    height: 40,
    color: 'white',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickerButton: {
    marginLeft: 10,
    color: 'white',
  },
});

export default MeetingSetup;