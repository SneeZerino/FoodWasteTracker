import React, { useState } from 'react';
import { View, Text, TextInput, Button, Modal, StyleSheet, ImageBackground } from 'react-native';
import { useRoute } from '@react-navigation/native';

const AddGroceriesInput = () => {
  const [productName, setProductName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [addtocommunity, setAddToCommunity] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const route = useRoute();
  const userId = route.params.userId;

  const serverUrl = 'http://sneeze.internet-box.ch:3006';

  const handleManualAdd = async () => {
    try {
      // Define the product data to be inserted
      const productData = {
        name: productName,
        expiry_date: expiryDate,
        user_id: userId, // Replace userId with the user ID obtained after login
        addtocommunity,
      };

        // Log the product data before making the API request
        console.log('Product Data:', productData);

      const response = await fetch(`${serverUrl}/api/foodwastetracker/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        // Product added successfully
        setProductName('');
        setExpiryDate('');
        setAddToCommunity(0);

        setIsModalVisible(false);
      } else {
        // Handle errors or show an error message
        console.error('Error adding product:', response.status);
      }
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  return (
    <View>
      <Button title="Add Groceries" onPress={() => setIsModalVisible(true)} />
      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalHeader}>Manual Add</Text>
          <TextInput
            placeholder="Product Name"
            value={productName}
            onChangeText={(text) => setProductName(text)}
            style={styles.input}
          />
          <TextInput
            placeholder="Expiry Date"
            value={expiryDate}
            onChangeText={(text) => setExpiryDate(text)}
            style={styles.input}
          />
          <Button title="Add" onPress={handleManualAdd} />
          <Button title="Cancel" onPress={() => setIsModalVisible(false)} />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    padding: 10,
    marginBottom: 10,
    width: '100%',
  },
});

export default AddGroceriesInput;
