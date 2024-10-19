// App.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SignInScreen from "./screens/SignInScreen";
import FacultyDashboard from "./screens/FacultyDashboard";
import HRDashboard from "./screens/HRDashboard";
import HODDashboard from "./screens/HODDashboard";
import PrincipalDashboard from "./screens/PrincipalDashboard";
import LeaveApplicationScreen from './screens/LeaveApplicationScreen'; // Import the new screen
import MeetingSetup from './screens/MeetingSetup';
import MeetingTabs from './screens/MeetingTabs';
import SettingsScreen from './screens/SettingsScreen';
import CreateUserScreen from './screens/CreateUserScreen';
import ttperson from './screens/ttperson';
import UploadTimetable  from './screens/UploadTimetable';
import FacultyTimetable  from './screens/FacultyTimetable';
import AdminTimetable  from './screens/AdminTimetable';

const Stack = createNativeStackNavigator(); // Ensure you have this line

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="SignIn">
        <Stack.Screen name="SignInScreen" component={SignInScreen} />
        <Stack.Screen name="LeaveApplication" component={LeaveApplicationScreen} />
        <Stack.Screen name="FacultyDashboard" component={FacultyDashboard} />
        <Stack.Screen name="HRDashboard" component={HRDashboard} />
        <Stack.Screen name="HODDashboard" component={HODDashboard} />
        <Stack.Screen name="PrincipalDashboard" component={PrincipalDashboard} />
        <Stack.Screen name="MeetingSetup" component={MeetingSetup} />
        <Stack.Screen name="MeetingTabs" component={MeetingTabs} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="CreateUser" component={CreateUserScreen} />
        <Stack.Screen name="ttperson" component={ttperson} />
        <Stack.Screen name="UploadTimetable" component={UploadTimetable} />
        <Stack.Screen name="FacultyTimetable" component={FacultyTimetable} />
        <Stack.Screen name="AdminTimetable" component={AdminTimetable} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;

// import { StatusBar } from 'expo-status-bar';
// import { StyleSheet, Text, View } from 'react-native';

// export default function App() {
//   return (
//     <View style={styles.container}>
//       <Text>Open up App.js to start working on your app!</Text>
//       <StatusBar style="auto" />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });
