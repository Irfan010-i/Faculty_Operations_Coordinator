import { initializeApp, getApps } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // Import storage

const firebaseConfig = {
  apiKey: "AIzaSyCW2-zmesYCo1WBxDXsQLM3F5g5U8myj3U",
  authDomain: "main-project-5c942.firebaseapp.com",
  projectId: "main-project-5c942",
  storageBucket: "main-project-5c942.appspot.com",
  messagingSenderId: "934463354954",
  appId: "1:934463354954:web:d79aa8b0b96b076c928eb3"
};

// Ensure Firebase is initialized only once
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Firebase services with the same app instance
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

const db = getFirestore(app);
const storage = getStorage(app);  // Initialize Firebase Storage

// Export the initialized services
export { auth, db, storage };


// import { initializeApp, getApps } from "firebase/app";
// import { initializeAuth, getReactNativePersistence } from "firebase/auth";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { getFirestore } from "firebase/firestore";
// import { getStorage } from "firebase/storage"; // Import storage

// const firebaseConfig = {
//   apiKey: "AIzaSyCW2-zmesYCo1WBxDXsQLM3F5g5U8myj3U",
//   authDomain: "main-project-5c942.firebaseapp.com",
//   projectId: "main-project-5c942",
//   storageBucket: "main-project-5c942.appspot.com",
//   messagingSenderId: "934463354954",
//   appId: "1:934463354954:web:d79aa8b0b96b076c928eb3"
// };

// // Ensure Firebase is initialized only once
// let app;
// if (getApps().length === 0) {
//   app = initializeApp(firebaseConfig);
// } else {
//   app = getApps()[0];
// }

// // Initialize Firebase Auth
// const auth = initializeAuth(app, {
//   persistence: getReactNativePersistence(AsyncStorage),
// });

// // Initialize Firestore and Storage
// const db = getFirestore(app);
// const storage = getStorage(app);  // Initialize Firebase Storage

// export { auth, db, storage };