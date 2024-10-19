import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from "react-native";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { db } from "../firebaseConfig";

const AdminTimetable = () => {
  const [faculties, setFaculties] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [timetable, setTimetable] = useState([]);

  const navigation = useNavigation();

  // Fetch the list of faculty members
  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        const usersRef = collection(db, "users");
        const facultyQuery = query(usersRef, where("role", "==", "faculty"));
        const querySnapshot = await getDocs(facultyQuery);

        const facultiesList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setFaculties(facultiesList);
      } catch (error) {
        console.error("Error fetching faculties:", error);
        Alert.alert("Error", "Failed to fetch faculties.");
      }
    };

    fetchFaculties();
  }, []);

  // Fetch the list of dates for a selected faculty
  const fetchDates = async (facultyId) => {
    try {
      const timetableRef = collection(db, `users/${facultyId}/timetable`);
      const timetableSnapshot = await getDocs(timetableRef);

      const datesList = timetableSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const uniqueDates = [...new Set(datesList.map((item) => item.date))];
      setDates(uniqueDates);
      setSelectedFaculty(facultyId);
    } catch (error) {
      console.error("Error fetching dates:", error);
      Alert.alert("Error", "Failed to fetch dates.");
    }
  };

  // Fetch the timetable for the selected date and faculty
  const fetchTimetable = async (facultyId, date) => {
    try {
      const timetableRef = collection(db, `users/${facultyId}/timetable`);
      const querySnapshot = await getDocs(query(timetableRef, where("date", "==", date)));

      const timetableData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setTimetable(timetableData);
      setSelectedDate(date);
    } catch (error) {
      console.error("Error fetching timetable:", error);
      Alert.alert("Error", "Failed to fetch timetable.");
    }
  };

  return (
    <View style={styles.container}>
      {!selectedFaculty ? (
        <>
          <Text style={styles.title}>Select a Faculty</Text>
          <FlatList
            data={faculties}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.facultyButton}
                onPress={() => fetchDates(item.id)}
              >
                <Text style={styles.facultyText}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </>
      ) : !selectedDate ? (
        <>
          <Text style={styles.title}>Select a Date</Text>
          <FlatList
            data={dates}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => fetchTimetable(selectedFaculty, item)}
              >
                <Text style={styles.dateText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
          {/* Back button to return to faculty selection */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedFaculty(null)} // Go back to faculty selection
          >
            <Text style={styles.backButtonText}>Back to Faculty List</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.title}>Timetable for {selectedDate}</Text>
          <FlatList
            data={timetable}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.timetableItem}>
                <Text style={styles.timetableText}>
                  <Text style={styles.boldText}>Class: </Text>{item.class}{"\n"}
                  <Text style={styles.boldText}>Date: </Text>{item.date}{"\n"}
                  <Text style={styles.boldText}>Day: </Text>{item.day}{"\n"}
                  <Text style={styles.boldText}>Faculty: </Text>{item.faculty}{"\n"}
                  <Text style={styles.boldText}>Subject: </Text>{item.subject}{"\n"}
                  <Text style={styles.boldText}>Time: </Text>{item.time}
                </Text>
              </View>
            )}
          />
          {/* Back button to return to date selection */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedDate(null)} // Go back to date selection
          >
            <Text style={styles.backButtonText}>Back to Date List</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f0f8ff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#007bff",
  },
  facultyButton: {
    padding: 15,
    marginVertical: 10,
    backgroundColor: "#007bff",
    borderRadius: 10,
  },
  facultyText: {
    fontSize: 18,
    color: "#fff",
    textAlign: "center",
  },
  dateButton: {
    padding: 15,
    marginVertical: 10,
    backgroundColor: "#28a745",
    borderRadius: 10,
  },
  dateText: {
    fontSize: 18,
    color: "#fff",
    textAlign: "center",
  },
  timetableItem: {
    padding: 15,
    marginVertical: 5,
    backgroundColor: "#fff",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 5,
  },
  timetableText: {
    fontSize: 16,
    color: "#333",
  },
  boldText: {
    fontWeight: "bold",
  },
  backButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#ff5733",
    borderRadius: 10,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
  },
});

export default AdminTimetable;





// import React, { useState, useEffect } from "react";
// import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from "react-native";
// import { collection, getDocs, query, where } from "firebase/firestore";
// import { useNavigation } from "@react-navigation/native"; // to handle navigation properly
// import { db } from "../firebaseConfig"; // Ensure you import from your firebaseConfig

// const AdminTimetable = () => {
//   const [faculties, setFaculties] = useState([]);
//   const [selectedFaculty, setSelectedFaculty] = useState(null);
//   const [dates, setDates] = useState([]);
//   const [selectedDate, setSelectedDate] = useState(null);
//   const [timetable, setTimetable] = useState([]);
  
//   const navigation = useNavigation(); // Use React Navigation hook

//   // Fetch the list of faculty members
//   useEffect(() => {
//     const fetchFaculties = async () => {
//       try {
//         const usersRef = collection(db, "users");
//         const facultyQuery = query(usersRef, where("role", "==", "faculty"));
//         const querySnapshot = await getDocs(facultyQuery);

//         const facultiesList = querySnapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }));

//         setFaculties(facultiesList);
//       } catch (error) {
//         console.error("Error fetching faculties:", error);
//         Alert.alert("Error", "Failed to fetch faculties.");
//       }
//     };

//     fetchFaculties();
//   }, []);

//   // Fetch the list of dates for a selected faculty
//   const fetchDates = async (facultyId) => {
//     try {
//       const timetableRef = collection(db, `users/${facultyId}/timetable`);
//       const timetableSnapshot = await getDocs(timetableRef);

//       const datesList = timetableSnapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));

//       // Extract unique dates
//       const uniqueDates = [...new Set(datesList.map((item) => item.date))];
//       setDates(uniqueDates);
//       setSelectedFaculty(facultyId);
//     } catch (error) {
//       console.error("Error fetching dates:", error);
//       Alert.alert("Error", "Failed to fetch dates.");
//     }
//   };

//   // Fetch the timetable for the selected date and faculty
//   const fetchTimetable = async (facultyId, date) => {
//     try {
//       const timetableRef = collection(db, `users/${facultyId}/timetable`);
//       const querySnapshot = await getDocs(query(timetableRef, where("date", "==", date)));

//       const timetableData = querySnapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));

//       setTimetable(timetableData);
//       setSelectedDate(date);
//     } catch (error) {
//       console.error("Error fetching timetable:", error);
//       Alert.alert("Error", "Failed to fetch timetable.");
//     }
//   };

//   // Function to navigate back step-by-step
//   const handleBackNavigation = () => {
//     if (selectedDate) {
//       setSelectedDate(null); // Go back to date selection
//     } else if (selectedFaculty) {
//       setSelectedFaculty(null); // Go back to faculty selection
//     } else {
//       navigation.goBack(); // Default navigation behavior
//     }
//   };

//   // Handle the hardware back button (optional)
//   useEffect(() => {
//     const backHandler = () => {
//       handleBackNavigation();
//       return true; // Prevent default behavior
//     };

//     const backListener = navigation.addListener("beforeRemove", backHandler);
//     return () => backListener(); // Cleanup
//   }, [selectedDate, selectedFaculty, navigation]);

//   return (
//     <View style={styles.container}>
//       {!selectedFaculty ? (
//         <>
//           <Text style={styles.title}>Select a Faculty</Text>
//           <FlatList
//             data={faculties}
//             keyExtractor={(item) => item.id}
//             renderItem={({ item }) => (
//               <TouchableOpacity
//                 style={styles.facultyButton}
//                 onPress={() => fetchDates(item.id)}
//               >
//                 <Text style={styles.facultyText}>{item.name}</Text>
//               </TouchableOpacity>
//             )}
//           />
//         </>
//       ) : !selectedDate ? (
//         <>
//           <Text style={styles.title}>Select a Date</Text>
//           <FlatList
//             data={dates}
//             keyExtractor={(item, index) => index.toString()}
//             renderItem={({ item }) => (
//               <TouchableOpacity
//                 style={styles.dateButton}
//                 onPress={() => fetchTimetable(selectedFaculty, item)}
//               >
//                 <Text style={styles.dateText}>{item}</Text>
//               </TouchableOpacity>
//             )}
//           />
//         </>
//       ) : (
//         <>
//           <Text style={styles.title}>Timetable for {selectedDate}</Text>
//           <FlatList
//             data={timetable}
//             keyExtractor={(item) => item.id}
//             renderItem={({ item }) => (
//               <View style={styles.timetableItem}>
//                 <Text style={styles.timetableText}>
//                   <Text style={styles.boldText}>Class: </Text>{item.class}{"\n"}
//                   <Text style={styles.boldText}>Date: </Text>{item.date}{"\n"}
//                   <Text style={styles.boldText}>Day: </Text>{item.day}{"\n"}
//                   <Text style={styles.boldText}>Faculty: </Text>{item.faculty}{"\n"}
//                   <Text style={styles.boldText}>Subject: </Text>{item.subject}{"\n"}
//                   <Text style={styles.boldText}>Time: </Text>{item.time}
//                 </Text>
//               </View>
//             )}
//           />
//           <TouchableOpacity
//             style={styles.backButton}
//             onPress={handleBackNavigation}
//           >
//             <Text style={styles.backButtonText}>Back</Text>
//           </TouchableOpacity>
//         </>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: "#f0f8ff",
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     marginBottom: 20,
//     color: "#007bff",
//   },
//   facultyButton: {
//     padding: 15,
//     marginVertical: 10,
//     backgroundColor: "#007bff",
//     borderRadius: 10,
//   },
//   facultyText: {
//     fontSize: 18,
//     color: "#fff",
//     textAlign: "center",
//   },
//   dateButton: {
//     padding: 15,
//     marginVertical: 10,
//     backgroundColor: "#28a745",
//     borderRadius: 10,
//   },
//   dateText: {
//     fontSize: 18,
//     color: "#fff",
//     textAlign: "center",
//   },
//   timetableItem: {
//     padding: 15,
//     marginVertical: 5,
//     backgroundColor: "#fff",
//     borderColor: "#ddd",
//     borderWidth: 1,
//     borderRadius: 5,
//   },
//   timetableText: {
//     fontSize: 16,
//     color: "#333",
//   },
//   boldText: {
//     fontWeight: "bold",
//   },
//   backButton: {
//     marginTop: 20,
//     padding: 15,
//     backgroundColor: "#ff5733",
//     borderRadius: 10,
//   },
//   backButtonText: {
//     color: "#fff",
//     fontSize: 18,
//     textAlign: "center",
//   },
// });

// export default AdminTimetable;
