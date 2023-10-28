import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { serverUrl } from './config';

function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistrationVisible, setRegistrationVisible] = useState(false);
  const [registrationUsername, setRegistrationUsername] = useState('');
  const [registrationPassword, setRegistrationPassword] = useState('');
  const [registrationFirstname, setRegistrationFirstname] = useState('');
  const [registrationLastname, setRegistrationLastname] = useState('');
  const [registrationEmail, setRegistrationEmail] = useState('');
  const [registrationError, setRegistrationError] = useState(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [loginError, setLoginError] = useState(null);

  const handleRegistration = async () => {
    // Check if any required fields are empty
    if (!registrationUsername || !registrationPassword || !registrationFirstname || !registrationLastname || !registrationEmail) {
      setRegistrationError('Please fill out all required fields.');
      return;
    }
    try {
      const registrationData = {
        username: registrationUsername,
        password: registrationPassword,
        firstname: registrationFirstname,
        lastname: registrationLastname,
        email: registrationEmail,
      };

      const response = await fetch(`${serverUrl}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData),
      });

      if (response.ok) {
        console.log('Registration successful');
        setRegistrationSuccess(true);
        setRegistrationUsername('');
        setRegistrationPassword('');
        setRegistrationFirstname('');
        setRegistrationLastname('');
        setRegistrationEmail('');
        setRegistrationError(null);
      } else {
        const errorData = await response.json();
        setRegistrationError(errorData.error || 'An error occurred during registration');
      }
    } catch (error) {
      console.error('Error during registration:', error);
      setRegistrationError('An error occurred during registration');
    }
  };

  const clearInputFields = () => {
    setUsername('');
    setPassword('');
  };
  
  const handleLogin = async () => {
    try {
      const response = await fetch(`${serverUrl}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const userData = await response.json();

        if (userData.userId) {
          const user_id = userData.userId;
          console.log('Retrieved userId:', user_id);
          navigation.navigate('Main', { userId: user_id });
          clearInputFields();
        } else {
          console.error('Server response is missing user ID');
        }
      } else {
        setLoginError('Invalid username or password');
      }
    } catch (error) {
      console.error('Error during authentication:', error);
    }
  };

  return (
    <ImageBackground
      source={require('../Pictures/background.jpg')}
      style={styles.backgroundImage}
    >
    <View style={styles.container}>
      {isRegistrationVisible ? (
        <View style={styles.background}>
            <View style={styles.registerMask}>
                <View>
                {registrationSuccess ? (
                    <Text style={styles.successText}>Registration successful</Text>
                ) : null}
                <Text style={styles.header}>Register a new account:</Text>
                <TextInput
                    placeholder="First Name"
                    value={registrationFirstname}
                    onChangeText={(text) => setRegistrationFirstname(text)}
                    style={styles.input}
                    placeholderTextColor="black"
                />
                <TextInput
                    placeholder="Last Name"
                    value={registrationLastname}
                    onChangeText={(text) => setRegistrationLastname(text)}
                    style={styles.input}
                    placeholderTextColor="black"
                />
                <TextInput
                    placeholder="Email"
                    value={registrationEmail}
                    onChangeText={(text) => setRegistrationEmail(text)}
                    style={styles.input}
                    placeholderTextColor="black"
                />
                <TextInput
                    placeholder="New Username"
                    value={registrationUsername}
                    onChangeText={(text) => setRegistrationUsername(text)}
                    style={styles.input}
                    placeholderTextColor="black"
                />
                <TextInput
                    placeholder="New Password"
                    value={registrationPassword}
                    onChangeText={(text) => setRegistrationPassword(text)}
                    secureTextEntry
                    style={styles.input}
                    placeholderTextColor="black"
                />
                <TouchableOpacity onPress={handleRegistration} style={styles.button}>
                    <Text style={styles.buttonText}>Register</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => {
                    setRegistrationVisible(false);
                    setRegistrationSuccess(false);
                    }}
                    style={styles.secondaryButton}
                >
                    <Text style={styles.secondaryButtonText}>Back to Login</Text>
                </TouchableOpacity>
                {registrationError && (
                    <Text style={styles.errorText}>{registrationError}</Text>
                )}
                </View>
            </View>
        </View> 
      ) : (
        <View style={styles.background}>
            <View style={styles.loginMask}>
                <View>
                <Text style={styles.header}>Login to the Fridge</Text>
                <TextInput
                    placeholder="Username"
                    value={username}
                    onChangeText={(text) => setUsername(text)}
                    style={styles.input}
                    placeholderTextColor="black"
                />
                <TextInput
                    placeholder="Password"
                    value={password}
                    onChangeText={(text) => setPassword(text)}
                    secureTextEntry
                    style={styles.input}
                    placeholderTextColor="black"
                />
                <TouchableOpacity onPress={handleLogin} style={styles.button}>
                    <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setRegistrationVisible(true)}
                    style={styles.secondaryButton}
                >
                    <Text style={styles.secondaryButtonText}>Create User</Text>
                </TouchableOpacity>
                {loginError && <Text style={styles.errorText}>{loginError}</Text>}
                </View>
            </View>
        </View> 
      )}
    </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }, 
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginMask: {
    width: 300,
    height: 280, 
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10, 
    padding: 20, 
  },
  registerMask: {
    width: 300, 
    height: 480, 
    backgroundColor: 'rgba(255, 255, 255, 0.8)', 
    borderRadius: 10, 
    padding: 20,
  },
    container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    fontSize: 24,
    marginBottom: 10,
  },
  successText: {
    color: 'green',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    width: '100%',
  },
  button: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    width: '100%',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 5,
    width: '100%',
  },
  secondaryButtonText: {
    color: 'white',
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    marginTop: 10,
  },
});

export default LoginScreen;
