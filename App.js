import React, { useState, useEffect } from 'react';
import {View, Text, TextInput, TouchableOpacity, ImageBackground, Modal, Button, Platform, FlatList} from 'react-native';
import CommunityItemsScreen from './CommunityItemsScreen';

const App = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [productName, setProductName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false); // Use a single state variable for modal visibility
  const [isRegistrationVisible, setRegistrationVisible] = useState(false);

  const [registrationUsername, setRegistrationUsername] = useState('');
  const [registrationPassword, setRegistrationPassword] = useState('');
  const [registrationError, setRegistrationError] = useState(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [loginError, setLoginError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userItems, setUserItems] = useState([]); // State variable to store user's items
  const [isStorageVisible, setStorageVisible] = useState(false);
  const [addtocommunity, setaddtocommunity] = useState(0);
  const [communityVisible, setCommunityVisible] = useState(false);



  useEffect(() => {
    (async () => {
      if (Platform.OS === 'android') {
        const { status } = await BarCodeScanner.requestPermissionsAsync();
        setHasPermission(status === 'granted');
      }
    })();
  }, 
  []);

const serverUrl = 'http://sneeze.internet-box.ch:3006';

const handleManualAdd = async () => {
    try {
      // Define the product data to be inserted
      const productData = {
        name: productName,
        expiry_date: expiryDate,
        user_id: userId,// Replace userId with the user ID obtained after login
        addtocommunity,
      };
  
      const response = await fetch(`${serverUrl}/api/foodwastetracker/products`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json',},
        body: JSON.stringify(productData),
      });
  
      if (response.ok) {
        // Product added successfully
        //console.log('Product added successfully');
        setProductName("");
        setExpiryDate("");
        setaddtocommunity(0);
        // Optionally, you can update the UI or show a success message
        // Close the manual add modal
        setIsModalVisible(false);
      } else {
        // Handle errors or show an error message
        console.error('Error adding product:', response.status);
      }
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

const handleRegistration = async () => {
    try {
      // Define the registration data to be sent
      const registrationData = {
        username: registrationUsername,
        password: registrationPassword,
      };

      const response = await fetch(`${serverUrl}/api/register`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json',},
        body: JSON.stringify(registrationData),
      });

      if (response.ok) {
        // Registration successful
        console.log('Registration successful');
        setRegistrationSuccess(true);
        // Optionally, update the UI or show a success message
        // Close the registration modal
        setRegistrationUsername('');
        setRegistrationPassword('');
        setRegistrationError(null);
      } else {
        // Registration failed, handle errors or show an error message
        const errorData = await response.json();
        setRegistrationError(errorData.error || 'An error occurred during registration');
      }
    } catch (error) {
      console.error('Error during registration:', error);
      setRegistrationError('An error occurred during registration');
    }
  };

const handleLogin = async () => {
    try {
      const response = await fetch(`${serverUrl}/api/login`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json',},
        body: JSON.stringify({ username, password }),
      });
  
      if (response.ok) {
        const userData = await response.json();
        console.log('Server Response:', userData); // Debugging statement
  
        if (userData.userId) {
          // The server returned the user's ID
          const user_id = userData.userId; // Use userData.userId
          setLoggedIn(true);
          setUserId(user_id);

        } else {
          // Handle the case where the server response does not include a user ID
          console.error('Server response is missing user ID');
        }
      } else {
        // Authentication failed
        //console.error('Authentication failed:', response.status);
        setLoginError('Invalid username or password');
        //console.log('Login error:', loginError);
      }
    } catch (error) {
      console.error('Error during authentication:', error);
      // Optionally, show an error message to the user
    }
  };
  
const handleLogout = () => {
    setUsername('');
    setPassword('');
    setLoggedIn(false);
    setCommunityVisible(false);
    // Navigate the user back to the login screen
  };

const handleOfferToCommunity = async (itemId) => {
    try {
      // Make a POST request to update the item's addToCommunity property
      const response = await fetch(`${serverUrl}/api/offer-to-community`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId,
        }),
      });
  
      if (response.ok) {
        // Item offered to the community successfully, update the state
        setUserItems((prevItems) =>
          prevItems.map((item) =>
            item.id === itemId ? { ...item, addtocommunity: 1 } : item
          )
        );
      } else {
        console.error('Failed to offer item to the community:', response.status);
      }
    } catch (error) {
      console.error('Error offering item to the community:', error);
    }
  };
  
  const fetchUserItems = async () => {
    try {
      const response = await fetch(`${serverUrl}/api/user-items?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUserItems(data);
      }
    } catch (error) {
      console.error('Error fetching user items:', error);
    }
  };
  useEffect(() => {
    if (loggedIn) {
      fetchUserItems();
    }
  }, [loggedIn]);
  
  // Call the function to fetch user items when isStorageVisible is true
  useEffect(() => {
    // Fetch the user's items when isStorageVisible is true
    if (loggedIn && isStorageVisible) {
      fetchUserItems();
    }
  }, [loggedIn, isStorageVisible]);
  
  const renderContent = () => {
    if (loggedIn) {
      return (
        <View style={{ alignItems: 'center' }}>
          <Text>Welcome, {username}!</Text>
          
          <Button
            title="Community"
            onPress={() => setCommunityVisible(true)}
          />
          <Button
            title="Add Groceries"
            onPress={() => setAddModalVisible(true)}
          />
           <Button
          title="Storage"
          onPress={() => {
            setStorageVisible(!isStorageVisible);
            // Fetch user items when Storage button is pressed
            if (!isStorageVisible) {
              fetchUserItems();
            }
          }}
        />
        {isStorageVisible && (
          <FlatList
            data={userItems}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
                <Text>Name: {item.name}</Text>
                <Text>Expiry Date: {item.expiryDate}</Text>
                {loggedIn && item.addtocommunity === 0 && (
                  <TouchableOpacity
                    onPress={() => handleOfferToCommunity(item.id)}
                    style={{
                      backgroundColor: 'purple',
                      padding: 10,
                      margin: 10,
                      borderRadius: 5,
                    }}
                  >
                    <Text style={{ color: 'white' }}>Offer to Community</Text>
                  </TouchableOpacity>
                )}
                {loggedIn && item.addtocommunity === 1 && (
                  <Text style={{ color: 'gray' }}>Currently offered to the Community</Text>
                )}
              </View>
            )}
          />

        )}

          <Modal
            animationType="slide"
            transparent={true}
            visible={isAddModalVisible}
            onRequestClose={() => setAddModalVisible(false)}
          >
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <View style={{ backgroundColor: 'white', padding: 20 }}>
                <Text style={{ fontSize: 18, marginBottom: 10 }}>Add new Groceries</Text>
                <Button
                  title="Add Manually"
                  onPress={() => {
                    setAddModalVisible(false); // Close the Add Groceries modal if it's open
                    setIsModalVisible(true); // Show the manual add modal
                  }}
                />
                <Button
                  title="Scan Barcode"
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
    } else if (isRegistrationVisible) {
      // Render the registration form
      return (
        <View style={{ alignItems: 'center' }}>
          {registrationSuccess ? (
            <Text style={{ color: 'green' }}>Registration successful</Text>
          ) : null}
          <Text>Register a new account:</Text>
          <TextInput
            placeholder="New Username"
            value={registrationUsername}
            onChangeText={(text) => setRegistrationUsername(text)}
            style={{ borderWidth: 1, width: 200, margin: 10, padding: 5 }}
          />
          <TextInput
            placeholder="New Password"
            value={registrationPassword}
            onChangeText={(text) => setRegistrationPassword(text)}
            secureTextEntry
            style={{ borderWidth: 1, width: 200, margin: 10, padding: 5 }}
          />
          <TouchableOpacity onPress={handleRegistration} style={{ backgroundColor: 'green', padding: 10 }}>
            <Text style={{ color: 'white' }}>Register</Text>
          </TouchableOpacity>
    
          {/* "Back to Login" button */}
          <TouchableOpacity onPress={() => { setRegistrationVisible(false); setRegistrationSuccess(false); }} style={{ backgroundColor: 'red', padding: 10, marginTop: 10 }}>
            <Text style={{ color: 'white' }}>Back to Login</Text>
          </TouchableOpacity>

          {registrationError && <Text style={{ color: 'red' }}>{registrationError}</Text>}
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
          {loginError && <Text style={{ color: 'red' }}>{loginError}</Text>}
    
          {/* "Create User" button */}
          <TouchableOpacity onPress={() => setRegistrationVisible(true)} style={{ backgroundColor: 'green', padding: 10, marginTop: 10 }}>
            <Text style={{ color: 'white' }}>Create User</Text>
          </TouchableOpacity>
        </View>
      );
    }
  }
  return (
    <ImageBackground
      source={require('./Pictures/background.jpg')}
      style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
    >
      {/* Logout button */}
      {loggedIn && (
        <TouchableOpacity
          onPress={handleLogout}
          style={{
            position: 'absolute',
            top: 50,
            right: 20,
            backgroundColor: 'red', // Customize the button's appearance
            padding: 10,
            borderRadius: 5,
          }}
        >
          <Text style={{ color: 'white' }}>Logout</Text>
        </TouchableOpacity>
      )}
      {/* Render CommunityItemsScreen when communityVisible is true */}
        {communityVisible && (
        <CommunityItemsScreen userId={userId} />
       )}

      <View
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          padding: 20,
          borderRadius: 10,
        }}
      >
        {renderContent()}
      </View>

      {/* Add test IDs to buttons */}
      {!loggedIn && (
        <TouchableOpacity
          onPress={() => setRegistrationVisible(true)}
          style={{
            backgroundColor: 'green',
            padding: 10,
            marginTop: 10,
          }}
          testID="createUserButton" // Add testID for registration button
        >
          <Text style={{ color: 'white' }}>Create User</Text>
        </TouchableOpacity>
      )}
      {!loggedIn && (
        <TouchableOpacity
          onPress={handleLogin}
          style={{
            backgroundColor: 'blue',
            padding: 10,
          }}
          testID="userloginbutton" // Add testID for login button
        >
          <Text style={{ color: 'white' }}>Login</Text>
        </TouchableOpacity>
      )}
    </ImageBackground>
  );
};

export default App;
