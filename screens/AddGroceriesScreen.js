import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Modal, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';
import { serverUrl } from './config';

const AddGroceriesInput = () => {
  const [productName, setProductName] = useState('');
  const [expiryDate, setExpiryDate] = useState(new Date());
  const [addtocommunity, setAddToCommunity] = useState(0);
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const navigation = useNavigation();
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [messageTimer, setMessageTimer] = useState(null);

  const route = useRoute();
  const userId = route.params.userId;


  const handleManualAdd = async () => {
    if (!productName || expiryDate === null) {
      console.log('Product name and expiry date are required.');
      setErrorMessage('Product name and expiry date are required.');
      setSuccessMessage('');

      const errorTimer = setTimeout(() => {
        setErrorMessage('');
      }, 3000);
  
      if (messageTimer) {
        clearTimeout(messageTimer);
      }
      setMessageTimer(errorTimer);
  
      return;
    }
  
    try {
      // Define the product data to be inserted
      const productData = {
        name: productName,
        expiry_date: expiryDate,
        user_id: userId,
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
  
        const communityProductData = {
          name: productName,
          expiry_date: expiryDate,
          user_id: userId,
          addtocommunity,
        };
  
        const communityResponse = await fetch(`${serverUrl}/api/global-items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(communityProductData),
        });
  
        if (communityResponse.ok) {
          console.log('Product added to the global_items table successfully.');
        } else {
          console.error('Error adding product to global_items table:', communityResponse.status);
        }
  
        setProductName('');
        setExpiryDate(new Date());
        setAddToCommunity(0);
        setScanned(false);
        setSuccessMessage('Product added successfully.');
        setErrorMessage('');

        const timer = setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
    
        setMessageTimer(timer);
      } else {
        // Handle errors or show an error message
        console.error('Error adding product:', response.status);
      }
    } catch (error) {
      console.error('Error adding product:', error);
      setErrorMessage('Error adding product: ' + error.message);
      setSuccessMessage('');
      if (messageTimer) {
        clearTimeout(messageTimer);
      }
    }
    setIsCameraActive(false);
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
        setIsCameraActive(false);
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
    const unsubscribe = navigation.addListener('blur', () => {
      setScanned(false);
      setIsCameraActive(false);
      setExpiryDate(new Date());
      setProductName('');
    });

    // Return a cleanup function to remove the event listener when the component unmounts
    return unsubscribe;
  }, [navigation]);


  return (
    <ImageBackground source={require('../Pictures/background.jpg')} style={styles.backgroundImage}>
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          <View style={styles.headerContainer}>
            <Text style={styles.header}>Add Groceries to Storage</Text>
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Product Name"
              value={productName}
              onChangeText={(text) => setProductName(text)}
              style={styles.input}
            />
            <View style={styles.rowContainer}>
              <Text style={styles.dateLabel}>Expiry Date</Text>
              <DateTimePicker
                value={expiryDate}
                mode="date"
                display="calendar"
                onChange={(event, selectedDate) => {
                  console.log('Selected Date:', selectedDate);
                  const currentDate = selectedDate || expiryDate;
                  setExpiryDate(currentDate);
                }}
              />
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleManualAdd}
            >
              <MaterialIcons name="post-add" size={50} color="green" />
            </TouchableOpacity>
            {successMessage && <Text style={styles.successMessage}>{successMessage}</Text>}
            {errorMessage && <Text style={styles.errorMessage}>{errorMessage}</Text>}
          </View>
          <View style={styles.buttonContainer}>
            {scanned ? (
              <TouchableOpacity
                style={styles.scanAgainButton}
                onPress={() => {
                  setScanned(false);
                  setExpiryDate(new Date());
                  setProductName('');
                  setIsCameraActive(true);
                }}
              >
                <Text style={styles.buttonText}>Tap to Scan Again</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.cameraToggleButton}
                onPress={() => setIsCameraActive(!isCameraActive)}
              >
                <Text style={styles.buttonText}>
                  {isCameraActive ? 'Deactivate Barcode Scanner' : 'Activate Barcode Scanner'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          {isCameraActive && hasPermission && (
            <BarCodeScanner
              onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
              style={styles.qrScanner}
            />
          )}
        </View>
      </View>
    </ImageBackground>
  );
  };

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: 8,
    padding: 8,
    backgroundColor: 'rgba(30,30,30,0.7)',
    borderRadius: 5,
  },
  header: {
    color: 'white',
    fontSize: 27,
  },
  button: {
    flex: 1,
    backgroundColor: '#3498db',
    padding: 20,
    borderRadius: 10,
    margin: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
  contentContainer: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 8,
    padding: 8,
    borderRadius: 5,
    marginBottom: 20,
  },
  inputContainer: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: 8,
    padding: 8,
    backgroundColor: 'rgba(30,30,30,0.7)', 
    borderRadius: 5,
    marginBottom: 20,
  },
  input: {
    width: 325,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 8,
    marginRight: 8,
    color: '#333',
    backgroundColor: 'white',
  },
  qrScanner: {
    width: '100%',
    height: 200,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#3498db',
  },
  cameraToggleButton: {
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  dateLabel: {
    color: 'white',
    fontSize: 15,
    marginLeft: 8,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 10,
  },
  successMessage: {
    color: 'green',
    fontSize: 16,
    marginBottom: 10,
  },
  errorMessage: {
    color: 'red',
    fontSize: 16,
    marginBottom: 10,
  },  
  scanAgainButton: {
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  }
});

export default AddGroceriesInput;