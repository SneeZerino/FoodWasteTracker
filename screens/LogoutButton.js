import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const LogoutButton = () => {
  const navigation = useNavigation();

  const handleLogout = () => {
    // Perform your logout action here
    // For example, clearing user credentials or tokens

    // Navigate back to the login screen
    navigation.navigate('Login'); // Replace 'Login' with your login screen name
  };

  return (
    <View style={styles.container}>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 10, // Adjust this for proper positioning
  },
});

export default LogoutButton;
