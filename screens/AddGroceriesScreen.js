import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Modal, StyleSheet, ImageBackground } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { BarCodeScanner } from 'expo-barcode-scanner';

const AddGroceriesInput = () => {
  const [productName, setProductName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [addtocommunity, setAddToCommunity] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

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

        setScanned(false)
      } else {
        // Handle errors or show an error message
        console.error('Error adding product:', response.status);
      }
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);
  
    try {
      // Make a request to the Open Food Facts API
      const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${data}.json`);
      const result = await response.json();
  
      // Check if the API call was successful and if it returned a product name
      if (response.ok && result.status === 1) {
        const product = result.product;
        const productName = product.product_name_en || 'Product Name Not Available';
        const brand = product.brands || '';
        
        // Combine product name and brand
        const combinedName = `${brand} ${productName}`;
        
        // Update the product name with the combined name
        setProductName(combinedName);
      } else {
        // Handle errors or show an error message
        console.error('Error fetching product name:', result.status_verbose);
      }
    } catch (error) {
      console.error('Error fetching product name:', error);
    }
  };

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

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
          {hasPermission && (
            <BarCodeScanner
              onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
              style={styles.qrScanner}
            />
          )}
          {scanned && (
            <Button title="Tap to Scan Again" onPress={() => setScanned(false)} />
          )}
          <Button title="Add" onPress={handleManualAdd} />
          <Button title="Close" onPress={() => {setIsModalVisible(false); setScanned(false);}} />
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
  qrScanner: {
    width: '100%',
    height: 200,
    marginBottom: 10,
  },
});

export default AddGroceriesInput;