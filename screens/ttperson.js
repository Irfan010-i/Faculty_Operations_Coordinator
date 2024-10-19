// TTPerson.js
import React from "react";
import { View, Text, Button, StyleSheet, TouchableOpacity, Alert } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

const TTPerson = ({ navigation }) => {

  const handleNotificationPress = () => {
    // Navigate to the notifications modal or screen
    Alert.alert("Notifications", "This feature is not implemented yet.");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Timetable Management</Text>
      <Button
        title="Upload Timetable (CSV)"
        onPress={() => navigation.navigate("UploadTimetable")} // Navigate to the upload screen
      />
      <TouchableOpacity onPress={handleNotificationPress} style={styles.notificationIcon}>
        <Icon name="notifications-outline" size={30} color="#000" />
      </TouchableOpacity>
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("ttperson")}>
          <Icon name="home-outline" size={24} color="#000" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("UploadTimetable")}>
          <Icon name="calendar-outline" size={24} color="#000" />
          <Text style={styles.navText}>Schedule</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => Alert.alert("Sign Out")}>
          <Icon name="log-out-outline" size={24} color="#000" />
          <Text style={styles.navText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
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
  notificationIcon: {
    position: "absolute",
    top: 20,
    right: 20,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    width: '100%',
    position: 'absolute',
    bottom: 0,
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    color: '#000',
  },
});

export default TTPerson;