import React, { useState } from 'react';
import { View, Text, TextInput, Button, Modal, StyleSheet } from 'react-native';

const ResidentialDataForm = ({ isVisible, userId, onSubmit, onClose }) => {
  const [postalCode, setPostalCode] = useState('');
  const [address, setAddress] = useState('');
  const [buildingNumber, setBuildingNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleSubmit = async () => {
    // Validate the form data here, e.g., check if fields are not empty
    if (!postalCode || !address || !buildingNumber || !phoneNumber) {
      // Handle validation error, e.g., show an error message
      console.log('Validation error: Please fill in all fields');
      return;
    }

    // Submit the data to the parent component
    try {
      const response = await onSubmit({ userId, postalCode, address, buildingNumber, phoneNumber });
      if (response && response.ok) {
        // Data inserted successfully
        console.log('Residential data inserted successfully');
      } else {
        console.error('Failed to insert residential data:', response.status);
      }
    } catch (error) {
      console.error('Error inserting residential data:', error);
    }

    // Clear the form fields
    setPostalCode('');
    setAddress('');
    setBuildingNumber('');
    setPhoneNumber('');

    // Close the modal
    onClose();
  };

  const handleBackButtonPress = () => {
    // Handle the back button press by closing the modal
    onClose();
  };

  return (
    <Modal visible={isVisible} animationType="slide">
      <View style={styles.container}>
        <Text>It seems you want to use the Community Function. For that, you need to have a valid Address saved.</Text>
        <Text>Enter Residential Data</Text>
        <TextInput
          placeholder="Postal Code (PLZ)"
          value={postalCode}
          onChangeText={setPostalCode}
          style={styles.input}
        />
        <TextInput
          placeholder="Address"
          value={address}
          onChangeText={setAddress}
          style={styles.input}
        />
        <TextInput
          placeholder="Building Number"
          value={buildingNumber}
          onChangeText={setBuildingNumber}
          style={styles.input}
        />
        <TextInput
          placeholder="Phone Number"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          style={styles.input}
        />
        <Button title="Submit" onPress={handleSubmit} />
        <Button title="Back" onPress={handleBackButtonPress} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    width: '80%',
    marginVertical: 10,
    padding: 10,
  },
});

export default ResidentialDataForm;
