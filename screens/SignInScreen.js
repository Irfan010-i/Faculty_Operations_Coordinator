// SignInScreen.js
import React, { useState, useEffect } from "react";
import { View, TextInput, Alert, StyleSheet, Text, Image, TouchableOpacity } from "react-native";
import { auth, db } from "../firebaseConfig";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Ionicons } from '@expo/vector-icons'; // Using Ionicons for custom checkbox icon

const SignInScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [staySignedIn, setStaySignedIn] = useState(false); // State for "stay signed in" checkbox

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is already logged in, navigate based on role
        handleUserLogin(user.uid);
      }
    });

    return () => unsubscribe(); // Clean up the auth listener on component unmount
  }, []);

  const handleUserLogin = async (userId) => {
    try {
      // Fetch user role
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        navigateToRoleScreen(userData.role);
      } else {
        setErrorMessage("User not found. Please check your email or password.");
      }
    } catch (error) {
      setErrorMessage("An error occurred. Please try again later.");
    }
  };

  const handleSignIn = async () => {
    try {
      setErrorMessage("");
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;

      handleUserLogin(userId);

      // Save sign-in state if the checkbox is selected
      if (staySignedIn) {
        console.log("Stay signed in is enabled.");
      }
    } catch (error) {
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        setErrorMessage("Invalid email or password. Please try again.");
      } else {
        setErrorMessage("An error occurred. Please try again later.");
      }
    }
  };

  const navigateToRoleScreen = (role) => {
    switch (role) {
      case "faculty":
        navigation.navigate("FacultyDashboard");
        break;
      case "HR":
        navigation.navigate("HRDashboard");
        break;
      case "HOD":
        navigation.navigate("HODDashboard");
        break;
      case "principal":
        navigation.navigate("PrincipalDashboard");
        break;
      case "tt":
        navigation.navigate("ttperson");
        break;
      default:
        Alert.alert("Role not recognized");
    }
  };

  return (
    <View style={styles.background}>
      <View style={styles.container}>
        <Image source={require('../assets/logo.jpg')} style={styles.logo} />
        <Text style={styles.title}>Welcome Back!</Text>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />
        <TextInput
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />
        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}

        {/* Custom Stay Signed In Checkbox */}
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setStaySignedIn(!staySignedIn)} // Toggle checkbox state
        >
          <Ionicons
            name={staySignedIn ? "checkbox-outline" : "square-outline"} // Change icon based on state
            size={24}
            color={staySignedIn ? "#4A90E2" : "#aaa"} // Color indication
          />
          <Text style={styles.checkboxLabel}>Keep me signed in</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleSignIn}>
          <View style={styles.buttonContent}>
            <Ionicons name="log-in-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}>Sign In</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e0f7fa",
  },
  container: {
    width: "90%",
    backgroundColor: "#ffffff",
    borderRadius: 15,
    padding: 30,
    elevation: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  input: {
    width: "100%",
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
    fontSize: 16,
    elevation: 1,
  },
  errorText: {
    color: "red",
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#4A90E2",
    paddingVertical: 15,
    borderRadius: 10,
    elevation: 3,
    width: "100%",
  },
  buttonContent: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 10,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  checkboxLabel: {
    fontSize: 16,
    marginLeft: 10,
  },
});

export default SignInScreen;



// import React, { useState } from "react";
// import { View, TextInput, Alert, StyleSheet, Text, Image, TouchableOpacity } from "react-native";
// import { auth, db } from "../firebaseConfig";
// import { signInWithEmailAndPassword } from "firebase/auth";
// import { doc, getDoc } from "firebase/firestore";
// import { Ionicons } from '@expo/vector-icons'; // Using Ionicons for custom checkbox icon

// const SignInScreen = ({ navigation }) => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [errorMessage, setErrorMessage] = useState("");
//   const [staySignedIn, setStaySignedIn] = useState(false); // State for "stay signed in" checkbox

//   const handleSignIn = async () => {
//     try {
//       setErrorMessage("");
//       const userCredential = await signInWithEmailAndPassword(auth, email, password);
//       const userId = userCredential.user.uid;

//       // Fetch user role
//       const userDoc = await getDoc(doc(db, "users", userId));
//       if (userDoc.exists()) {
//         const userData = userDoc.data();
//         navigateToRoleScreen(userData.role);

//         // Save sign-in state if the checkbox is selected
//         if (staySignedIn) {
//           // Logic for staying signed in can go here
//           console.log("Stay signed in is enabled.");
//         }
//       } else {
//         setErrorMessage("User not found. Please check your email or password.");
//       }
//     } catch (error) {
//       if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
//         setErrorMessage("Invalid email or password. Please try again.");
//       } else {
//         setErrorMessage("An error occurred. Please try again later.");
//       }
//     }
//   };

//   const navigateToRoleScreen = (role) => {
//     switch (role) {
//       case "faculty":
//         navigation.navigate("FacultyDashboard");
//         break;
//       case "HR":
//         navigation.navigate("HRDashboard");
//         break;
//       case "HOD":
//         navigation.navigate("HODDashboard");
//         break;
//       case "principal":
//         navigation.navigate("PrincipalDashboard");
//         break;
//       case "tt":
//         navigation.navigate("ttperson");
//         break;
//       default:
//         Alert.alert("Role not recognized");
//     }
//   };

//   return (
//     <View style={styles.background}>
//       <View style={styles.container}>
//         <Image source={require('../assets/logo.jpg')} style={styles.logo} />
//         <Text style={styles.title}>Welcome Back!</Text>
//         <TextInput
//           placeholder="Email"
//           value={email}
//           onChangeText={setEmail}
//           style={styles.input}
//         />
//         <TextInput
//           placeholder="Password"
//           secureTextEntry
//           value={password}
//           onChangeText={setPassword}
//           style={styles.input}
//         />
//         {errorMessage ? (
//           <Text style={styles.errorText}>{errorMessage}</Text>
//         ) : null}

//         {/* Custom Stay Signed In Checkbox */}
//         <TouchableOpacity
//           style={styles.checkboxContainer}
//           onPress={() => setStaySignedIn(!staySignedIn)} // Toggle checkbox state
//         >
//           <Ionicons
//             name={staySignedIn ? "checkbox-outline" : "square-outline"} // Change icon based on state
//             size={24}
//             color={staySignedIn ? "#4A90E2" : "#aaa"} // Color indication
//           />
//           <Text style={styles.checkboxLabel}>Keep me signed in</Text>
//         </TouchableOpacity>

//         <TouchableOpacity style={styles.button} onPress={handleSignIn}>
//           <View style={styles.buttonContent}>
//             <Ionicons name="log-in-outline" size={20} color="#fff" />
//             <Text style={styles.buttonText}>Sign In</Text>
//           </View>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   background: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#e0f7fa",
//   },
//   container: {
//     width: "90%",
//     backgroundColor: "#ffffff",
//     borderRadius: 15,
//     padding: 30,
//     elevation: 10,
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//   },
//   logo: {
//     width: 100,
//     height: 100,
//     borderRadius: 50,
//     marginBottom: 20,
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: "bold",
//     marginBottom: 20,
//     color: "#333",
//   },
//   input: {
//     width: "100%",
//     padding: 15,
//     marginBottom: 15,
//     borderWidth: 1,
//     borderColor: "#ddd",
//     borderRadius: 10,
//     backgroundColor: "#f9f9f9",
//     fontSize: 16,
//     elevation: 1,
//   },
//   errorText: {
//     color: "red",
//     marginBottom: 15,
//   },
//   button: {
//     backgroundColor: "#4A90E2",
//     paddingVertical: 15,
//     borderRadius: 10,
//     elevation: 3,
//     width: "100%",
//   },
//   buttonContent: {
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   buttonText: {
//     color: "#fff",
//     fontSize: 16,
//     marginLeft: 10,
//   },
//   checkboxContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 15,
//   },
//   checkboxLabel: {
//     fontSize: 16,
//     marginLeft: 10,
//   },
// });

// export default SignInScreen;




// // SignInScreen.js
// import React, { useState } from "react";
// import { View, TextInput, Alert, StyleSheet, Text, Image, TouchableOpacity } from "react-native";
// import { auth, db } from "../firebaseConfig";
// import { signInWithEmailAndPassword } from "firebase/auth";
// import { doc, getDoc } from "firebase/firestore";
// import { Ionicons } from '@expo/vector-icons'; // Importing Ionicons

// const SignInScreen = ({ navigation }) => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [errorMessage, setErrorMessage] = useState("");

//   const handleSignIn = async () => {
//     try {
//       // Clear previous error message
//       setErrorMessage("");

//       // Sign in the user
//       const userCredential = await signInWithEmailAndPassword(auth, email, password);
//       const userId = userCredential.user.uid; // Get the UID
//       console.log("User signed in successfully:", userId);

//       // Fetch user role from Firestore
//       const userDoc = await getDoc(doc(db, "users", userId));
//       if (userDoc.exists()) {
//         const userData = userDoc.data();
//         console.log("User document found:", userData);
//         navigateToRoleScreen(userData.role);
//       } else {
//         // If user document does not exist in Firestore
//         console.log("User document does not exist in Firestore.");
//         setErrorMessage("User not found. Please check your email or password.");
//       }
//     } catch (error) {
//       console.error("Sign-in error:", error);
//       // Handle specific Firebase Auth errors
//       if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
//         setErrorMessage("Invalid email or password. Please try again.");
//       } else {
//         setErrorMessage("An error occurred. Please try again later.");
//       }
//     }
//   };

//   const navigateToRoleScreen = (role) => {
//     switch (role) {
//       case "faculty":
//         navigation.navigate("FacultyDashboard");
//         break;
//       case "HR":
//         navigation.navigate("HRDashboard");
//         break;
//       case "HOD":
//         navigation.navigate("HODDashboard");
//         break;
//       case "principal":
//         navigation.navigate("PrincipalDashboard");
//         break;
//       case "tt":
//         navigation.navigate("ttperson");
//         break;
//       default:
//         Alert.alert("Role not recognized");
//     }
//   };

//   return (
//     <View style={styles.background}>
//       <View style={styles.container}>
//         <Image source={require('../assets/logo.jpg')} style={styles.logo} />
//         <Text style={styles.title}>Welcome Back!</Text>
//         <TextInput
//           placeholder="Email"
//           value={email}
//           onChangeText={setEmail}
//           style={styles.input}
//         />
//         <TextInput
//           placeholder="Password"
//           secureTextEntry
//           value={password}
//           onChangeText={setPassword}
//           style={styles.input}
//         />
//         {errorMessage ? (
//           <Text style={styles.errorText}>{errorMessage}</Text>
//         ) : null}
//         <TouchableOpacity style={styles.button} onPress={handleSignIn}>
//           <View style={styles.buttonContent}>
//             <Ionicons name="log-in-outline" size={20} color="#fff" />
//             <Text style={styles.buttonText}>Sign In</Text>
//           </View>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   background: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#e0f7fa", // Lighter teal background for a refreshing look
//   },
//   container: {
//     width: "90%",
//     backgroundColor: "#ffffff",
//     borderRadius: 15,
//     padding: 30,
//     elevation: 10,
//     alignItems: "center",
//     shadowColor: "#000", // Added shadow for better depth
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//   },
//   logo: {
//     width: 100,
//     height: 100,
//     borderRadius: 50, // Circular logo
//     marginBottom: 20,
//   },
//   title: {
//     fontSize: 28, // Increased font size for better visibility
//     fontWeight: "bold",
//     marginBottom: 20,
//     color: "#333",
//   },
//   input: {
//     width: "100%",
//     padding: 15,
//     marginBottom: 15,
//     borderWidth: 1,
//     borderColor: "#ddd",
//     borderRadius: 10,
//     backgroundColor: "#f9f9f9",
//     fontSize: 16, // Increased font size for better readability
//     elevation: 1,
//   },
//   errorText: {
//     color: "red",
//     marginBottom: 15,
//   },
//   button: {
//     backgroundColor: "#4A90E2", // Light blue color for the button
//     paddingVertical: 15,
//     borderRadius: 10,
//     elevation: 3,
//     width: "100%", // Full width for button
//   },
//   buttonContent: {
//     flexDirection: "row",
//     justifyContent: "center", // Center the content horizontally
//     alignItems: "center", // Center the content vertically
//   },
//   buttonText: {
//     color: "#fff",
//     fontSize: 16,
//     marginLeft: 10,
//   },
// });

// export default SignInScreen;