import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { getAuth } from "firebase/auth";
import moment from "moment"; // To handle dates easily

const FacultyTimetable = () => {
  const [timetables, setTimetables] = useState([]);
  const [filteredDates, setFilteredDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const timetableRef = collection(db, `users/${user.uid}/timetable`);
          const querySnapshot = await getDocs(timetableRef);

          let timetableData = [];
          querySnapshot.forEach((doc) => {
            timetableData.push({ id: doc.id, ...doc.data() });
          });

          // Filter timetables for future dates
          const currentDate = moment(); // Today's date
          const upcomingDates = timetableData
            .filter((item) => moment(item.date, "DD/MM/YYYY").isSameOrAfter(currentDate))
            .map((item) => moment(item.date, "DD/MM/YYYY").format("DD/MM/YYYY"))
            .filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates

          setTimetables(timetableData);
          setFilteredDates(upcomingDates);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching timetable:", error);
        setLoading(false);
      }
    };

    fetchTimetable();
  }, []);

  const renderDateItem = ({ item }) => (
    <TouchableOpacity style={styles.dateButton} onPress={() => setSelectedDate(item)}>
      <Text style={styles.dateText}>{item}</Text>
    </TouchableOpacity>
  );

  const renderTimetableItem = ({ item }) => (
    <View style={styles.timetableItem}>
      <Text style={styles.timetableText}>Date: {item.date}</Text>
      <Text style={styles.timetableText}>Day: {item.day}</Text>
      <Text style={styles.timetableText}>Time: {item.time}</Text>
      <Text style={styles.timetableText}>Subject: {item.subject}</Text>
      <Text style={styles.timetableText}>Class: {item.class}</Text> 
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!selectedDate ? (
        <>
          <Text style={styles.title}>Upcoming Dates</Text>
          {filteredDates.length > 0 ? (
            <FlatList
              data={filteredDates}
              renderItem={renderDateItem}
              keyExtractor={(item) => item}
              contentContainerStyle={styles.list}
            />
          ) : (
            <Text style={styles.noTimetableText}>No upcoming timetables available</Text>
          )}
        </>
      ) : (
        <>
          <Text style={styles.title}>Timetable for {selectedDate}</Text>
          <FlatList
            data={timetables.filter((item) => item.date === selectedDate)}
            renderItem={renderTimetableItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
          />
          <TouchableOpacity style={styles.backButton} onPress={() => setSelectedDate(null)}>
            <Text style={styles.backButtonText}>Back to Dates</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  dateButton: {
    backgroundColor: "#007bff",
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
  },
  dateText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
  },
  list: {
    paddingBottom: 20,
  },
  timetableItem: {
    backgroundColor: "#ffffff",
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 4,
  },
  timetableText: {
    fontSize: 16,
  },
  backButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#007bff",
    borderRadius: 8,
    alignItems: "center",
  },
  backButtonText: {
    color: "#fff",
    fontSize: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noTimetableText: {
    textAlign: "center",
    fontSize: 18,
    color: "#777",
  },
});

export default FacultyTimetable;


// import React, { useState, useEffect } from "react";
// import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert } from "react-native";
// import { collection, getDocs, query, where } from "firebase/firestore";
// import { db, auth } from "../firebaseConfig"; // Ensure auth is imported

// const FacultyTimetable = () => {
//   const [timetable, setTimetable] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // Fetch the timetable when the component mounts
//   useEffect(() => {
//     const fetchTimetable = async () => {
//       try {
//         const user = auth.currentUser;
//         if (!user) {
//           Alert.alert("Error", "No user is logged in.");
//           return;
//         }

//         const usersRef = collection(db, "users");
//         const querySnapshot = await getDocs(query(usersRef, where("email", "==", user.email)));

//         if (!querySnapshot.empty) {
//           querySnapshot.forEach(async (docSnap) => {
//             const facultyUID = docSnap.id;
//             const timetableRef = collection(db, `users/${facultyUID}/timetable`);
//             const timetableSnapshot = await getDocs(timetableRef);

//             const fetchedTimetable = timetableSnapshot.docs.map((doc) => doc.data());
//             setTimetable(fetchedTimetable);
//             setLoading(false);
//           });
//         } else {
//           Alert.alert("Error", "No timetable found for this user.");
//           setLoading(false);
//         }
//       } catch (error) {
//         console.error("Error fetching timetable:", error);
//         Alert.alert("Error", "Failed to fetch timetable.");
//         setLoading(false);
//       }
//     };

//     fetchTimetable();
//   }, []);

//   // Render each timetable item
//   const renderItem = ({ item }) => (
//     <View style={styles.timetableItem}>
//       <Text style={styles.timetableText}>Date: {item.date}</Text>
//       <Text style={styles.timetableText}>Day: {item.day}</Text>
//       <Text style={styles.timetableText}>Time: {item.time}</Text>
//       <Text style={styles.timetableText}>Subject: {item.subject}</Text>
//       <Text style={styles.timetableText}>Class: {item.class}</Text>
//     </View>
//   );

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Your Timetable</Text>
//       {loading ? (
//         <ActivityIndicator size="large" color="#0000ff" />
//       ) : timetable.length === 0 ? (
//         <Text>No timetable available.</Text>
//       ) : (
//         <FlatList
//           data={timetable}
//           renderItem={renderItem}
//           keyExtractor={(item, index) => index.toString()}
//         />
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: "#f5f5f5",
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     marginBottom: 20,
//   },
//   timetableItem: {
//     backgroundColor: "#e0f7fa",
//     padding: 15,
//     marginVertical: 8,
//     borderRadius: 10,
//   },
//   timetableText: {
//     fontSize: 16,
//   },
// });

// export default FacultyTimetable;
