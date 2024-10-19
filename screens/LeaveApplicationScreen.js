// LeaveApplicationScreen.js
import React, { useState } from "react";
import { View, Text, Button, TextInput, Alert, StyleSheet, ScrollView, ImageBackground, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { db } from "../firebaseConfig"; // Adjust the path if necessary
import { addDoc, collection, doc, getDoc, updateDoc } from "firebase/firestore";
import { auth } from "../firebaseConfig"; // Import your auth configuration

const LeaveApplicationForm = () => {
  const [leaveType, setLeaveType] = useState("casual");
  const [leaveDuration, setLeaveDuration] = useState("single"); // Single or Multiple Day
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [fromDateString, setFromDateString] = useState("");
  const [toDateString, setToDateString] = useState("");

  const handleSubmit = async () => {
    try {
      const facultyId = auth.currentUser.uid; // Get the current user's ID
      const facultyRef = doc(db, "users", facultyId);

      const facultySnapshot = await getDoc(facultyRef);

      if (!facultySnapshot.exists()) {
        Alert.alert(
          "Error",
          "Faculty data not found. Please contact your administrator."
        );
        return;
      }

      const facultyData = facultySnapshot.data();
      const facultyName = facultyData.name;

      const totalCasualLeavesTaken = facultyData.totalCasualLeavesTaken || 0;
      const totalMedicalLeavesTaken = facultyData.totalMedicalLeavesTaken || 0;
      const totalMaternityLeavesTaken =
        facultyData.totalMaternityLeavesTaken || 0;

      // Calculate the number of days for multiple-day leave
      const leaveDays =
        leaveDuration === "multiple"
          ? calculateLeaveDays(fromDateString, toDateString)
          : 1; // Single-day leave counts as 1

      const totalLeavesTaken = getTotalLeavesTaken(leaveType, {
        totalCasualLeavesTaken,
        totalMedicalLeavesTaken,
        totalMaternityLeavesTaken,
      });

      const allowedLimit = getAllowedLimit(leaveType);

      if (totalLeavesTaken + leaveDays > allowedLimit) {
        Alert.alert(
          "Error",
          `You have exceeded the allowed limit for ${leaveType} leaves.`
        );
        return;
      }

      await addDoc(collection(db, "leaveApplications"), {
        facultyId,
        facultyName,
        leaveType,
        leaveDuration, // Indicate if it's single or multiple
        leaveDates: {
          from: new Date(fromDateString),
          to: leaveDuration === "multiple" ? new Date(toDateString) : null, // Set "to" date for multiple leaves only
        },
        status: "pending",
        reviewHistory: [],
      });

      await updateDoc(facultyRef, {
        [`total${capitalize(leaveType)}LeavesTaken`]: totalLeavesTaken + leaveDays,
      });

      Alert.alert("Success", "Leave application submitted successfully!");
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to submit leave application. Please try again later."
      );
    }
  };

  const calculateLeaveDays = (fromDate, toDate) => {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const diffTime = Math.abs(to - from);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Include both from and to dates
  };

  const getTotalLeavesTaken = (leaveType, facultyData) => {
    switch (leaveType) {
      case "casual":
        return facultyData.totalCasualLeavesTaken || 0;
      case "medical":
        return facultyData.totalMedicalLeavesTaken || 0;
      case "maternity":
        return facultyData.totalMaternityLeavesTaken || 0;
      default:
        return 0;
    }
  };

  const getAllowedLimit = (leaveType) => {
    switch (leaveType) {
      case "casual":
        return 15;
      case "medical":
        return 10;
      case "maternity":
        return 1;
      default:
        return 0;
    }
  };

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  const showDatePicker = (type) => {
    if (type === "from") {
      setShowFromPicker(true);
    } else {
      setShowToPicker(true);
    }
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || new Date();
    if (showFromPicker) {
      setShowFromPicker(false);
      setFromDate(currentDate);
      setFromDateString(currentDate.toISOString().slice(0, 10));
    } else if (showToPicker) {
      setShowToPicker(false);
      setToDate(currentDate);
      setToDateString(currentDate.toISOString().slice(0, 10));
    }
  };

  return (
    <ImageBackground
      source={require("../assets/bg1.png")} // Path to your image in the assets folder
      style={styles.backgroundImage}
      imageStyle={{ opacity: 0.9 }} // Set the opacity of the image
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Leave Application</Text>

        <Text style={styles.label}>Leave Type:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={leaveType}
            onValueChange={(itemValue) => setLeaveType(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Casual Leave" value="casual" />
            <Picker.Item label="Medical Leave" value="medical" />
            <Picker.Item label="Maternity Leave" value="maternity" />
          </Picker>
        </View>

        <Text style={styles.label}>Leave Duration:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={leaveDuration}
            onValueChange={(itemValue) => setLeaveDuration(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Single Day" value="single" />
            <Picker.Item label="Multiple Days" value="multiple" />
          </Picker>
        </View>

        {leaveDuration === "single" && (
          <>
            <Text style={styles.label}>Date of Leave:</Text>
            <View style={styles.dateInputContainer}>
              <TextInput
                style={styles.dateInput}
                value={fromDateString}
                placeholder="YYYY-MM-DD"
                editable={false}
              />
              <TouchableOpacity style={styles.dateButton} onPress={() => showDatePicker("from")}>
                <Text style={styles.dateButtonText}>Select</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {leaveDuration === "multiple" && (
          <>
            <Text style={styles.label}>From Date:</Text>
            <View style={styles.dateInputContainer}>
              <TextInput
                style={styles.dateInput}
                value={fromDateString}
                placeholder="YYYY-MM-DD"
                editable={false}
              />
              <TouchableOpacity style={styles.dateButton} onPress={() => showDatePicker("from")}>
                <Text style={styles.dateButtonText}>Select</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>To Date:</Text>
            <View style={styles.dateInputContainer}>
              <TextInput
                style={styles.dateInput}
                value={toDateString}
                placeholder="YYYY-MM-DD"
                editable={false}
              />
              <TouchableOpacity style={styles.dateButton} onPress={() => showDatePicker("to")}>
                <Text style={styles.dateButtonText}>Select</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {showFromPicker && (
          <DateTimePicker
            value={fromDate}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}
        {showToPicker && (
          <DateTimePicker
            value={toDate}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center', // Centers content vertically
    alignItems: 'center', // Centers content horizontally
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
    color: "#fff",
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
    color: "#fff",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 20,
    overflow: "hidden",
    width: '100%',
  },
  picker: {
    height: 50,
    color: "#fff",
  },
  dateInputContainer: {
    flexDirection: "row", // Keep the input and button in a row
    alignItems: "center", // Center them vertically
    justifyContent: "space-between", // Ensure they are spaced out
    marginBottom: 20, // Add spacing at the bottom
    width: '100%', // Full width
  },
  
  dateInput: {
    flex: 0.75, // Adjust the width so the input takes most space (75%)
    height: 50, // Match height of picker
    borderColor: "#ccc", // Light border color like picker
    borderWidth: 1, // Similar border thickness as picker
    borderRadius: 5, // Rounded corners
    padding: 10, // Inner padding for text
    color: "#fff", // Text color (same as picker)
    backgroundColor: "transparent", // Transparent background
  },
  
  dateButton: {
    flex: 0.2, // Adjust width so the button takes up less space (20%)
    backgroundColor: "transparent", // No background color
    paddingVertical: 10, // Adjust padding for button
    paddingHorizontal: 15,
    borderRadius: 5, // Rounded corners
    alignItems: "center", // Center text in the button
    justifyContent: "center",
    borderWidth: 0, // Remove border around button
    backgroundColor: "white",
  },
  
  dateButtonText: {
    color: "black", // White text to match the rest
    fontWeight: "bold", // Bold text for the button
  },
  
  submitButton: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    width: '50%',
  },
  submitButtonText: {
    color: "black",
    fontSize: 18,
    fontWeight: "bold",
  },
  backgroundImage: {
    flex: 1,
    justifyContent: "center",
  },
});

export default LeaveApplicationForm;



// // LeaveApplicationScreen.js [WORKING CODE, JUST NEEDED UI IMPROVEMENT]
// import React, { useState } from "react";
// import {View,Text,Button,TextInput,Alert,StyleSheet,ScrollView,ImageBackground} from "react-native";
// import { Picker } from "@react-native-picker/picker";
// import DateTimePicker from "@react-native-community/datetimepicker";
// import { db } from "../firebaseConfig"; // Adjust the path if necessary
// import { addDoc, collection, doc, getDoc, updateDoc } from "firebase/firestore";
// import { auth } from "../firebaseConfig"; // Import your auth configuration

// const LeaveApplicationForm = () => {
//   const [leaveType, setLeaveType] = useState("casual");
//   const [leaveDuration, setLeaveDuration] = useState("single"); // Single or Multiple Day
//   const [fromDate, setFromDate] = useState(new Date());
//   const [toDate, setToDate] = useState(new Date());
//   const [showFromPicker, setShowFromPicker] = useState(false);
//   const [showToPicker, setShowToPicker] = useState(false);
//   const [fromDateString, setFromDateString] = useState("");
//   const [toDateString, setToDateString] = useState("");

//   const handleSubmit = async () => {
//     try {
//       const facultyId = auth.currentUser.uid; // Get the current user's ID
//       const facultyRef = doc(db, "users", facultyId);

//       const facultySnapshot = await getDoc(facultyRef);

//       if (!facultySnapshot.exists()) {
//         Alert.alert(
//           "Error",
//           "Faculty data not found. Please contact your administrator."
//         );
//         return;
//       }

//       const facultyData = facultySnapshot.data();
//       const facultyName = facultyData.name;

//       const totalCasualLeavesTaken = facultyData.totalCasualLeavesTaken || 0;
//       const totalMedicalLeavesTaken = facultyData.totalMedicalLeavesTaken || 0;
//       const totalMaternityLeavesTaken =
//         facultyData.totalMaternityLeavesTaken || 0;

//       // Calculate the number of days for multiple-day leave
//       const leaveDays =
//         leaveDuration === "multiple"
//           ? calculateLeaveDays(fromDateString, toDateString)
//           : 1; // Single-day leave counts as 1

//       const totalLeavesTaken = getTotalLeavesTaken(leaveType, {
//         totalCasualLeavesTaken,
//         totalMedicalLeavesTaken,
//         totalMaternityLeavesTaken,
//       });

//       const allowedLimit = getAllowedLimit(leaveType);

//       if (totalLeavesTaken + leaveDays > allowedLimit) {
//         Alert.alert(
//           "Error",
//           `You have exceeded the allowed limit for ${leaveType} leaves.`
//         );
//         return;
//       }

//       await addDoc(collection(db, "leaveApplications"), {
//         facultyId,
//         facultyName,
//         leaveType,
//         leaveDuration, // Indicate if it's single or multiple
//         leaveDates: {
//           from: new Date(fromDateString),
//           to: leaveDuration === "multiple" ? new Date(toDateString) : null, // Set "to" date for multiple leaves only
//         },
//         status: "pending",
//         reviewHistory: [],
//       });

//       await updateDoc(facultyRef, {
//         [`total${capitalize(leaveType)}LeavesTaken`]: totalLeavesTaken + leaveDays,
//       });

//       Alert.alert("Success", "Leave application submitted successfully!");
//     } catch (error) {
//       Alert.alert(
//         "Error",
//         "Failed to submit leave application. Please try again later."
//       );
//     }
//   };

//   const calculateLeaveDays = (fromDate, toDate) => {
//     const from = new Date(fromDate);
//     const to = new Date(toDate);
//     const diffTime = Math.abs(to - from);
//     return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Include both from and to dates
//   };

//   const getTotalLeavesTaken = (leaveType, facultyData) => {
//     switch (leaveType) {
//       case "casual":
//         return facultyData.totalCasualLeavesTaken || 0;
//       case "medical":
//         return facultyData.totalMedicalLeavesTaken || 0;
//       case "maternity":
//         return facultyData.totalMaternityLeavesTaken || 0;
//       default:
//         return 0;
//     }
//   };

//   const getAllowedLimit = (leaveType) => {
//     switch (leaveType) {
//       case "casual":
//         return 15;
//       case "medical":
//         return 10;
//       case "maternity":
//         return 180;
//       default:
//         return 0;
//     }
//   };

//   const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

//   const showDatePicker = (type) => {
//     if (type === "from") {
//       setShowFromPicker(true);
//     } else {
//       setShowToPicker(true);
//     }
//   };

//   const onDateChange = (event, selectedDate) => {
//     const currentDate = selectedDate || new Date();
//     if (showFromPicker) {
//       setShowFromPicker(false);
//       setFromDate(currentDate);
//       setFromDateString(currentDate.toISOString().slice(0, 10));
//     } else if (showToPicker) {
//       setShowToPicker(false);
//       setToDate(currentDate);
//       setToDateString(currentDate.toISOString().slice(0, 10));
//     }
//   };

//   return (
//     <ImageBackground
//       source={require("../assets/bg1.png")} // Path to your image in the assets folder
//       style={styles.backgroundImage}
//       imageStyle={{ opacity: 1 }} // Set the opacity of the image
//     >
//       <ScrollView contentContainerStyle={styles.container}>
//         <Text style={styles.label}>Leave Type:</Text>
//         <Picker
//           selectedValue={leaveType}
//           onValueChange={(itemValue) => setLeaveType(itemValue)}
//           style={styles.picker}
//         >
//           <Picker.Item label="Casual Leave" value="casual" />
//           <Picker.Item label="Medical Leave" value="medical" />
//           <Picker.Item label="Maternity Leave" value="maternity" />
//         </Picker>

//         <Text style={styles.label}>Leave Duration:</Text>
//         <Picker
//           selectedValue={leaveDuration}
//           onValueChange={(itemValue) => setLeaveDuration(itemValue)}
//           style={styles.picker}
//         >
//           <Picker.Item label="Single Day" value="single" />
//           <Picker.Item label="Multiple Days" value="multiple" />
//         </Picker>

//         {leaveDuration === "single" && (
//           <>
//             <Text style={styles.label}>Date of Leave:</Text>
//             <View style={styles.dateInputContainer}>
//               <TextInput
//                 style={styles.dateInput}
//                 value={fromDateString}
//                 placeholder="YYYY-MM-DD"
//                 editable={false}
//               />
//               <Button title="Select" onPress={() => showDatePicker("from")} />
//             </View>
//           </>
//         )}

//         {leaveDuration === "multiple" && (
//           <>
//             <Text style={styles.label}>From Date:</Text>
//             <View style={styles.dateInputContainer}>
//               <TextInput
//                 style={styles.dateInput}
//                 value={fromDateString}
//                 placeholder="YYYY-MM-DD"
//                 editable={false}
//               />
//               <Button title="Select" onPress={() => showDatePicker("from")} />
//             </View>

//             <Text style={styles.label}>To Date:</Text>
//             <View style={styles.dateInputContainer}>
//               <TextInput
//                 style={styles.dateInput}
//                 value={toDateString}
//                 placeholder="YYYY-MM-DD"
//                 editable={false}
//               />
//               <Button title="Select" onPress={() => showDatePicker("to")} />
//             </View>
//           </>
//         )}

//         {showFromPicker && (
//           <DateTimePicker
//             value={fromDate}
//             mode="date"
//             display="default"
//             onChange={onDateChange}
//           />
//         )}
//         {showToPicker && (
//           <DateTimePicker
//             value={toDate}
//             mode="date"
//             display="default"
//             onChange={onDateChange}
//           />
//         )}

//         <View style={styles.submitContainer}>
//           <Button title="Submit" onPress={handleSubmit} color="green" />
//         </View>
//       </ScrollView>
//     </ImageBackground>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flexGrow: 1,
//     padding: 20,
//   },
//   label: {
//     fontSize: 18,
//     fontWeight: "bold",
//     marginBottom: 8,
//     color: "white",
//   },
//   picker: {
//     height: 50,
//     backgroundColor: "white",
//     marginBottom: 20,
//     borderRadius: 8,
//     paddingHorizontal: 10,
//   },
//   dateInputContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 20,
//   },
//   dateInput: {
//     flex: 1,
//     backgroundColor: "white",
//     padding: 10,
//     borderRadius: 8,
//   },
//   submitContainer: {
//     marginTop: 20,
//     alignSelf: "center",
//   },
//   backgroundImage: {
//     flex: 1,
//     resizeMode: "cover",
//   },
// });

// export default LeaveApplicationForm;


// // LeaveApplicationScreen.js
// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   Button,
//   TextInput,
//   Alert,
//   StyleSheet,
//   ScrollView,
//   ImageBackground,
// } from "react-native";
// import { Picker } from "@react-native-picker/picker";
// import DateTimePicker from "@react-native-community/datetimepicker";
// import { db } from "../firebaseConfig"; // Adjust the path if necessary
// import { addDoc, collection, doc, getDoc, updateDoc } from "firebase/firestore";
// import { auth } from "../firebaseConfig"; // Import your auth configuration

// const LeaveApplicationForm = () => {
//   const [leaveType, setLeaveType] = useState("casual");
//   const [fromDate, setFromDate] = useState(new Date());
//   const [toDate, setToDate] = useState(new Date());
//   const [showFromPicker, setShowFromPicker] = useState(false);
//   const [showToPicker, setShowToPicker] = useState(false);
//   const [fromDateString, setFromDateString] = useState("");
//   const [toDateString, setToDateString] = useState("");

//   const handleSubmit = async () => {
//     try {
//       const facultyId = auth.currentUser.uid; // Get the current user's ID
//       const facultyRef = doc(db, "users", facultyId);

//       const facultySnapshot = await getDoc(facultyRef);

//       if (!facultySnapshot.exists()) {
//         Alert.alert(
//           "Error",
//           "Faculty data not found. Please contact your administrator."
//         );
//         return;
//       }

//       const facultyData = facultySnapshot.data();
//       const facultyName = facultyData.name;

//       const totalCasualLeavesTaken = facultyData.totalCasualLeavesTaken || 0;
//       const totalMedicalLeavesTaken = facultyData.totalMedicalLeavesTaken || 0;
//       const totalMaternityLeavesTaken =
//         facultyData.totalMaternityLeavesTaken || 0;

//       const totalLeavesTaken = getTotalLeavesTaken(leaveType, {
//         totalCasualLeavesTaken,
//         totalMedicalLeavesTaken,
//         totalMaternityLeavesTaken,
//       });
//       const allowedLimit = getAllowedLimit(leaveType);

//       if (totalLeavesTaken + 1 > allowedLimit) {
//         Alert.alert(
//           "Error",
//           `You have exceeded the allowed limit for ${leaveType} leaves.`
//         );
//         return;
//       }

//       await addDoc(collection(db, "leaveApplications"), {
//         facultyId,
//         facultyName,
//         leaveType,
//         leaveDates: {
//           from: new Date(fromDateString),
//           to: new Date(toDateString),
//         },
//         status: "pending",
//         reviewHistory: [],
//       });

//       await updateDoc(facultyRef, {
//         [`total${capitalize(leaveType)}LeavesTaken`]: totalLeavesTaken + 1,
//       });

//       Alert.alert("Success", "Leave application submitted successfully!");
//     } catch (error) {
//       Alert.alert(
//         "Error",
//         "Failed to submit leave application. Please try again later."
//       );
//     }
//   };

//   const getTotalLeavesTaken = (leaveType, facultyData) => {
//     switch (leaveType) {
//       case "casual":
//         return facultyData.totalCasualLeavesTaken || 0;
//       case "medical":
//         return facultyData.totalMedicalLeavesTaken || 0;
//       case "maternity":
//         return facultyData.totalMaternityLeavesTaken || 0;
//       default:
//         return 0;
//     }
//   };

//   const getAllowedLimit = (leaveType) => {
//     switch (leaveType) {
//       case "casual":
//         return 15;
//       case "medical":
//         return 10;
//       case "maternity":
//         return 180;
//       default:
//         return 0;
//     }
//   };

//   const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

//   const showDatePicker = (type) => {
//     if (type === "from") {
//       setShowFromPicker(true);
//     } else {
//       setShowToPicker(true);
//     }
//   };

//   const onDateChange = (event, selectedDate) => {
//     const currentDate = selectedDate || new Date();
//     if (showFromPicker) {
//       setShowFromPicker(false);
//       setFromDate(currentDate);
//       setFromDateString(currentDate.toISOString().slice(0, 10));
//     } else if (showToPicker) {
//       setShowToPicker(false);
//       setToDate(currentDate);
//       setToDateString(currentDate.toISOString().slice(0, 10));
//     }
//   };

//   return (
//     <ImageBackground
//       source={require("../assets/bg1.png")} // Path to your image in the assets folder
//       style={styles.backgroundImage}
//       imageStyle={{ opacity: 1 }} // Set the opacity of the image
//     >
//       <ScrollView contentContainerStyle={styles.container}>
//         <Text style={styles.label}>Leave Type:</Text>
//         <Picker
//           selectedValue={leaveType}
//           onValueChange={(itemValue) => setLeaveType(itemValue)}
//           style={styles.picker}
//         >
//           <Picker.Item label="Casual Leave" value="casual" />
//           <Picker.Item label="Medical Leave" value="medical" />
//           <Picker.Item label="Maternity Leave" value="maternity" />
//         </Picker>

//         <Text style={styles.label}>From Date:</Text>
//         <View style={styles.dateInputContainer}>
//           <TextInput
//             style={styles.dateInput}
//             value={fromDateString}
//             placeholder="YYYY-MM-DD"
//             editable={false}
//           />
//           <Button title="Select" onPress={() => showDatePicker("from")} />
//         </View>
//         {showFromPicker && (
//           <DateTimePicker
//             value={fromDate}
//             mode="date"
//             display="default"
//             onChange={onDateChange}
//             minimumDate={new Date()}
//           />
//         )}

//         <Text style={styles.label}>To Date:</Text>
//         <View style={styles.dateInputContainer}>
//           <TextInput
//             style={styles.dateInput}
//             value={toDateString}
//             placeholder="YYYY-MM-DD"
//             editable={false}
//           />
//           <Button title="Select" onPress={() => showDatePicker("to")} />
//         </View>
//         {showToPicker && (
//           <DateTimePicker
//             value={toDate}
//             mode="date"
//             display="default"
//             onChange={onDateChange}
//             minimumDate={new Date()}
//           />
//         )}
//         <Button
//           title="Submit"
//           onPress={handleSubmit}
//           color="#4A90E2"
//           style={styles.submitButton}
//         />
//       </ScrollView>
//     </ImageBackground>
//   );
// };

// const styles = StyleSheet.create({
//   backgroundImage: {
//     flex: 1,
//     resizeMode: "cover",
//   },
//   container: {
//     flexGrow: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 20,
//     backgroundColor: "rgba(0, 0, 0, 0.5)",
//   },
//   label: {
//     marginVertical: 10,
//     fontSize: 16,
//     color: "#fff",
//   },
//   picker: {
//     height: 50,
//     width: 200,
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     elevation: 2,
//   },
//   dateInputContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 20,
//   },
//   dateInput: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 4,
//     padding: 10,
//     marginRight: 10,
//     width: 150,
//     textAlign: "center",
//     backgroundColor: "#f9f9f9",
//   },
//   submitButton: {
//     paddingVertical: 15,
//     paddingHorizontal: 30,
//     borderRadius: 10,
//     elevation: 3,
//     marginTop: 20,
//   },
// });

// export default LeaveApplicationForm;