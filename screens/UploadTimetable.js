import React, { useState, useEffect } from "react";
import { View, Text, Button, StyleSheet, Alert, Platform } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";
import { storage, db } from "../firebaseConfig"; // Ensure you import from your firebaseConfig
import { getDownloadURL, ref, uploadBytesResumable, uploadBytes,getStorage, } from "firebase/storage";
import { collection, doc, setDoc,getDocs, query,where,addDoc,serverTimestamp  } from "firebase/firestore";
import Papa from "papaparse";

const UploadTimetable = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  // Request permissions when the app starts
  useEffect(() => {
    const requestPermissions = async () => {
      if (Platform.OS !== 'web') {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert("Permission Denied", "Permission to access files is required!");
        } else {
          setPermissionGranted(true);
        }
      }
    };
    requestPermissions();
  }, []);

  const pickFile = async () => {
    if (!permissionGranted) {
      Alert.alert("Permission Required", "Please grant file access permissions.");
      return;
    }
  
    try {
      console.log("Attempting to pick a file...");
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*", // Allow any file type
        copyToCacheDirectory: true,
      });
  
      console.log("DocumentPicker result: ", result);
  
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        console.log("File picked successfully: ", file);
        setSelectedFile(file);
  
        // Read file content
        const fileContent = await FileSystem.readAsStringAsync(file.uri);
        console.log("File content: ", fileContent); // This will display the content of the file
  
        // Parse CSV file content
        const parsedData = Papa.parse(fileContent, {
          header: true, // Consider first row as header
          skipEmptyLines: true,
        });
        console.log("Parsed CSV data: ", parsedData.data);
  
        // Clean up the parsed data by trimming spaces in field names
        const cleanedData = parsedData.data.map(row => {
          const cleanedRow = {};
          Object.keys(row).forEach(key => {
            cleanedRow[key.trim()] = row[key]; // Trim spaces in both keys and values
          });
          return cleanedRow;
        });
  
        console.log("Cleaned CSV data: ", cleanedData);
  
        // Upload the file to Firebase Storage
        uploadFileToStorage(file, cleanedData);
      } else {
        console.log("File picking was canceled or failed.");
        Alert.alert("Error", "Failed to pick a file.");
      }
    } catch (error) {
      console.error("Error picking file:", error);
      Alert.alert("Error", `An error occurred while picking the file: ${error.message}`);
    }
  };

  const uploadFileToStorage = async (file, cleanedData) => {
    try {
      const storageRef = ref(storage, `timetables/${file.name}`);
      const response = await fetch(file.uri);
      const blob = await response.blob();
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      console.log("File available at:", downloadURL);
  
      for (const timetableEntry of cleanedData) {
        const facultyName = timetableEntry.faculty.trim().toLowerCase();
        
        const usersRef = collection(db, "users");
        const querySnapshot = await getDocs(query(usersRef, where("name", "==", facultyName)));
  
        if (!querySnapshot.empty) {
          querySnapshot.forEach(async (docSnap) => {
            const facultyUID = docSnap.id;
            const timetableRef = collection(db, `users/${facultyUID}/timetable`);
            
            await addDoc(timetableRef, {
              ...timetableEntry,
              timestamp: serverTimestamp(),
            });
            console.log(`Timetable added for ${facultyName}`);
          });
        } else {
          console.warn(`No user found for faculty name: ${facultyName}`);
        }
      }
  
      console.log("Timetable stored successfully!");
    } catch (error) {
      console.error("Error uploading file:", error);
      Alert.alert("Error", `Failed to upload timetable: ${error.message}`);
    }
  };
  
  const storeTimetableInFirestore = async (timetableData) => {
    try {
      timetableData.forEach(async (row) => {
        const { faculty, date, day, time, subject, class: className } = row;
  
        if (!faculty || !date || !day || !time || !subject || !className) {
          console.warn("Skipping invalid row: ", row);
          return;
        }
  
        const trimmedFaculty = faculty.trim().toLowerCase();
        const trimmedTime = time.trim();
  
        const usersRef = collection(db, "users");
        const facultyQuerySnapshot = await getDocs(query(usersRef, where("name", "==", trimmedFaculty)));
  
        if (!facultyQuerySnapshot.empty) {
          facultyQuerySnapshot.forEach(async (docSnap) => {
            const facultyUID = docSnap.id;
            const facultyDocRef = doc(db, "users", facultyUID);
            const timetableRef = collection(facultyDocRef, "timetable");
  
            await setDoc(doc(timetableRef), {
              date: date.trim(),
              day: day.trim(),
              time: trimmedTime,
              subject: subject.trim(),
              className: className.trim(),
            });
  
            console.log(`Timetable added for ${trimmedFaculty}`);
          });
        } else {
          console.warn(`No user found for faculty name: ${trimmedFaculty}`);
        }
      });
  
      console.log("Timetable stored successfully!");
    } catch (error) {
      console.error("Error storing timetable in Firestore:", error);
      Alert.alert("Error", "Failed to store timetable data.");
    }
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Timetable</Text>
      <Button title="Pick a File" onPress={pickFile} disabled={uploading} />
      {selectedFile && (
        <Text style={styles.selectedFileText}>
          Selected File: {selectedFile.name}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  selectedFileText: {
    marginVertical: 10,
    fontSize: 16,
    color: "#007bff",
  },
});

export default UploadTimetable;



// import React, { useState, useEffect } from "react"; //(Upload working with parsing)
// import { View, Text, Button, StyleSheet, Alert, Platform } from "react-native";
// import * as DocumentPicker from "expo-document-picker";
// import * as MediaLibrary from "expo-media-library";
// import * as FileSystem from "expo-file-system";
// import Papa from "papaparse"; // Import the PapaParse library

// const UploadFile = () => {
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [csvData, setCsvData] = useState(null);
//   const [permissionGranted, setPermissionGranted] = useState(false);

//   useEffect(() => {
//     const requestPermissions = async () => {
//       if (Platform.OS !== 'web') {
//         const { status } = await MediaLibrary.requestPermissionsAsync();
//         if (status !== 'granted') {
//           Alert.alert("Permission Denied", "Permission to access files is required!");
//         } else {
//           setPermissionGranted(true);
//         }
//       }
//     };
//     requestPermissions();
//   }, []);

//   const pickFile = async () => {
//     if (!permissionGranted) {
//       Alert.alert("Permission Required", "Please grant file access permissions.");
//       return;
//     }
  
//     try {
//       console.log("Attempting to pick a file...");
//       const result = await DocumentPicker.getDocumentAsync({
//         type: "*/*", // Allow any file type
//         copyToCacheDirectory: true,
//       });
  
//       console.log("DocumentPicker result: ", result);
  
//       if (!result.canceled && result.assets && result.assets.length > 0) {
//         const file = result.assets[0];
//         console.log("File picked successfully: ", file);
//         setSelectedFile(file);
  
//         if (!file.uri.startsWith("file://")) {
//           console.error("Invalid file URI format: ", file.uri);
//           Alert.alert("Error", "Invalid file URI format.");
//           return;
//         }
  
//         // Read file content
//         const fileContent = await FileSystem.readAsStringAsync(file.uri);
//         console.log("File content: ", fileContent);
  
//         // Parse CSV data using PapaParse
//         const parsedData = Papa.parse(fileContent, {
//           header: true, // Use the first row as headers
//           skipEmptyLines: true
//         });
//         console.log("Parsed CSV data: ", parsedData.data);
//         setCsvData(parsedData.data);

//         Alert.alert("Success", `File selected: ${file.name}`);
//       } else {
//         console.log("File picking was canceled or failed.");
//         Alert.alert("Error", "Failed to pick a file.");
//       }
//     } catch (error) {
//       console.error("Error picking file:", error);
//       Alert.alert("Error", `An error occurred while picking the file: ${error.message}`);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Upload File</Text>
//       <Button title="Pick a File" onPress={pickFile} />
//       {selectedFile && <Text style={styles.selectedFileText}>Selected File: {selectedFile.name}</Text>}
//       {csvData && <Text style={styles.csvDataText}>CSV Data: {JSON.stringify(csvData)}</Text>}
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
//   selectedFileText: {
//     marginVertical: 10,
//     fontSize: 16,
//     color: "#007bff",
//   },
//   csvDataText: {
//     marginVertical: 10,
//     fontSize: 14,
//     color: "#333",
//   },
// });

// export default UploadFile;


// import React, { useState, useEffect } from "react"; (First Working Code for file upload)
// import { View, Text, Button, StyleSheet, Alert, Platform } from "react-native";
// import * as DocumentPicker from "expo-document-picker";
// import * as MediaLibrary from "expo-media-library";
// import * as FileSystem from "expo-file-system";

// const UploadFile = () => {
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [permissionGranted, setPermissionGranted] = useState(false);

//   // Request permissions when the app starts
//   useEffect(() => {
//     const requestPermissions = async () => {
//       if (Platform.OS !== 'web') {
//         const { status } = await MediaLibrary.requestPermissionsAsync();
//         if (status !== 'granted') {
//           Alert.alert("Permission Denied", "Permission to access files is required!");
//         } else {
//           setPermissionGranted(true);
//         }
//       }
//     };
//     requestPermissions();
//   }, []);

//   const pickFile = async () => {
//     if (!permissionGranted) {
//       Alert.alert("Permission Required", "Please grant file access permissions.");
//       return;
//     }
  
//     try {
//       console.log("Attempting to pick a file...");
//       const result = await DocumentPicker.getDocumentAsync({
//         type: "*/*", // Allow any file type
//         copyToCacheDirectory: true,
//       });
  
//       console.log("DocumentPicker result: ", result);
  
//       if (!result.canceled && result.assets && result.assets.length > 0) {
//         const file = result.assets[0];
//         console.log("File picked successfully: ", file);
//         setSelectedFile(file);
  
//         // Check the URI format
//         if (!file.uri.startsWith("file://")) {
//           console.error("Invalid file URI format: ", file.uri);
//           Alert.alert("Error", "Invalid file URI format.");
//           return;
//         }
  
//         // Read file content just for testing (no CSV parsing here, only file read)
//         const fileContent = await FileSystem.readAsStringAsync(file.uri);
//         console.log("File content: ", fileContent); // This will display the content of the file
  
//         Alert.alert("Success", `File selected: ${file.name}`);
//       } else {
//         console.log("File picking was canceled or failed.");
//         Alert.alert("Error", "Failed to pick a file.");
//       }
//     } catch (error) {
//       console.error("Error picking file:", error);
//       Alert.alert("Error", `An error occurred while picking the file: ${error.message}`);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Upload File</Text>
//       <Button title="Pick a File" onPress={pickFile} />
//       {selectedFile && <Text style={styles.selectedFileText}>Selected File: {selectedFile.name}</Text>}
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
//   selectedFileText: {
//     marginVertical: 10,
//     fontSize: 16,
//     color: "#007bff",
//   },
// });

// export default UploadFile;