// MeetingTabs.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { db, auth } from '../firebaseConfig';
import { collection, onSnapshot, query } from 'firebase/firestore';

const MeetingTabs = () => {
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);

  useEffect(() => {
    const fetchUpcomingMeetings = () => {
      const facultyId = auth.currentUser.uid; // Get the current user's ID
      const meetingsQuery = query(collection(db, 'meetings'));

      const unsubscribe = onSnapshot(meetingsQuery, async (querySnapshot) => {
        const meetings = [];
        const currentTime = new Date(); // Get the current date and time
        

        querySnapshot.forEach((doc) => {
          const meetingData = doc.data();

          const rawDate = meetingData.date; // "2024-08-27"
          const rawTime = meetingData.time; // "9:05:00 PM"

          // Convert time to 24-hour format
          const [time, modifier] = rawTime.split(' ');
          let [hours, minutes, seconds] = time.split(':');

          if (modifier === 'PM' && hours !== '12') {
            hours = (parseInt(hours, 10) + 12).toString();
          } else if (modifier === 'AM' && hours === '12') {
            hours = '00';
          }

          // Create a Date object from the date and time
          const meetingDateTime = new Date(`${rawDate}T${hours}:${minutes}:${seconds}`);

          // Check if the meeting is upcoming
          if (meetingDateTime > currentTime) {
            meetings.push({
              id: doc.id,
              ...meetingData,
            });
          }
        });

        // Sort meetings by date and time in descending order
        meetings.sort((a, b) => new Date(b.date + 'T' + b.time) - new Date(a.date + 'T' + a.time));

        setUpcomingMeetings(meetings);
      });

      return () => unsubscribe(); // Cleanup subscription on unmount
    };

    fetchUpcomingMeetings();
  }, []);

  return (
    <View style={styles.container}>
      {upcomingMeetings.length === 0 ? (
        <Text style={styles.noMeetingsText}>No upcoming meetings.</Text>
      ) : (
        <FlatList
          data={upcomingMeetings}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.meetingItem}>
              <Text style={styles.meetingSubject}>{item.subject}</Text>
              <Text style={styles.meetingOrganizer}>Organizer: {item.organizerRole}</Text>
              <Text style={styles.meetingDate}>Date: {item.date}</Text>
              <Text style={styles.meetingTime}>Time: {item.time}</Text>
              <Text style={styles.meetingLocation}>Location: {item.location || "Not specified"}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  meetingItem: {
    padding: 15,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  meetingSubject: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007bff',
  },
  meetingDate: {
    fontSize: 16,
    color: '#555',
  },
  meetingOrganizer: {
    paddingTop: 5,
    fontSize: 16,
    color: '#555',
  },
  meetingTime: {
    fontSize: 16,
    color: '#555',
  },
  meetingLocation: {
    fontSize: 16,
    color: '#555',
  },
  noMeetingsText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#888',
    marginTop: 20,
  },
});

export default MeetingTabs;