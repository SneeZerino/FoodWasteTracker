import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ImageBackground, Modal, Button, Platform } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';

const App = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [isManualAddModalVisible, setManualAddModalVisible] = useState(false);
  const [isScannerVisible, setScannerVisible] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [productName, setProductName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false); // Use a single state variable for modal visibility


  useEffect(() => {
    (async () => {
      if (Platform.OS === 'android') {
        const { status } = await BarCodeScanner.requestPermissionsAsync();
        setHasPermission(status === 'granted');
      }
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    // Handle the scanned barcode data (e.g., add the item to the grocery list)
    // logic comes later here
    console.log(`Bar code with type ${type} and data ${data} has been scanned!`);
    // Close the scanner
    setScannerVisible(false);
  };

  const handleManualAdd = async () => {
    try {
      // Replace with your Raspberry Pi's local IP address and port
      const serverUrl = 'http://192.168.1.109:5432';

      // Define the product data to be inserted
      const productData = {
        name: productName,
        expiry_date: expiryDate,
      };

      const response = await fetch(`${serverUrl}/api/foodwastetracker/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        // Product added successfully
        console.log('Product added successfully');
        // Optionally, you can update the UI or show a success message
        // Close the manual add modal
        setIsModalVisible(false); // Set modal visibility to false to close it
      } else {
        // Handle errors or show an error message
        console.error('Error adding product:', response.status);
      }
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const openScanner = async () => {
    setScanned(false);
    setScannerVisible(true);
  };

  const handleLogin = () => {
    // Fake authentication (replace later with actual authentication logic)
    if (username === 'demo' && password === 'password') {
      setLoggedIn(true);
    }
  };

  const renderContent = () => {
    if (loggedIn) {
      return (
        <View style={{ alignItems: 'center' }}>
          <Text>Welcome, {username}!</Text>
          <Button
            title="Add Groceries"
            onPress={() => setAddModalVisible(true)}
          />
          <Modal
            animationType="slide"
            transparent={true}
            visible={isAddModalVisible}
            onRequestClose={() => setAddModalVisible(false)}
          >
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <View style={{ backgroundColor: 'white', padding: 20 }}>
                <Text style={{ fontSize: 18, marginBottom: 10 }}>Add Groceries</Text>
                <Button
                  title="Add Manually"
                  onPress={() => {
                    setAddModalVisible(false); // Close the Add Groceries modal if it's open
                    setIsModalVisible(true); // Show the manual add modal
                  }}
                />
                <Button
                  title="Scan Barcode"
                  onPress={openScanner}
                />
                <Button
                  title="Cancel"
                  onPress={() => setAddModalVisible(false)}
                />
              </View>
            </View>
          </Modal>
          <Modal
            animationType="slide"
            transparent={true}
            visible={isScannerVisible}
            onRequestClose={() => setScannerVisible(false)}
          >
             <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              {Platform.OS === 'ios' ? (
                <BarCodeScanner
                  onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                  style={{ width: '100%', height: '100%' }}
                />
              ) : (
                hasPermission ? (
                  <BarCodeScanner
                    onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                    style={{ width: '100%', height: '100%' }}
                  />
                ) : (
                  <Text>No access to camera</Text>
                )
              )}
              <Button
                title="Close Scanner"
                onPress={() => setScannerVisible(false)}
              />
            </View>
          </Modal>
          <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)} // Close the modal
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: 'white', padding: 20 }}>
            <Text style={{ fontSize: 18, marginBottom: 10 }}>Add Product Manually</Text>
            <TextInput
              placeholder="Product Name"
              value={productName}
              onChangeText={(text) => setProductName(text)}
              style={{ borderWidth: 1, width: 200, margin: 10, padding: 5 }}
            />
            <TextInput
              placeholder="Expiry Date (YYYY-MM-DD)"
              value={expiryDate}
              onChangeText={(text) => setExpiryDate(text)}
              style={{ borderWidth: 1, width: 200, margin: 10, padding: 5 }}
            />
            <Button
              title="Add Product"
              onPress={handleManualAdd}
            />
            <Button
              title="Cancel"
              onPress={() => setIsModalVisible(false)} // Close the modal
            />
          </View>
        </View>
      </Modal>
        </View>
      );
      
    } else {
      return (
        <View style={{ alignItems: 'center' }}>
          <Text>Login to the Fridge</Text>
          <TextInput
            placeholder="Username"
            value={username}
            onChangeText={(text) => setUsername(text)}
            style={{ borderWidth: 1, width: 200, margin: 10, padding: 5 }}
          />
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={(text) => setPassword(text)}
            secureTextEntry
            style={{ borderWidth: 1, width: 200, margin: 10, padding: 5 }}
          />
          <TouchableOpacity onPress={handleLogin} style={{ backgroundColor: 'blue', padding: 10 }}>
            <Text style={{ color: 'white' }}>Login</Text>
          </TouchableOpacity>
        </View>
      );
    }
  };

  return (
    <ImageBackground
      source={require('./Pictures/background.jpg')}
      style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
    >
      <View
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          padding: 20,
          borderRadius: 10,
        }}
      >
        {renderContent()}
      </View>
    </ImageBackground>
  );

   // Add a Modal for manual product entry
   
};

export default App;