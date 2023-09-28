import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import App from './App';

describe('Integration Tests', () => {
  it('renders login screen by default', () => {
    const { getByText } = render(<App />);
    const loginText = getByText('Login to the Fridge');
    expect(loginText).toBeTruthy();
  });

  it('renders registration screen when "Create User" button is pressed', () => {
    const { getByText, getByPlaceholderText, getByTestId } = render(<App />);
    const createUserButton = getByTestId('createUserButton');
    fireEvent.press(createUserButton);
    const registrationText = getByText('Register a new account:');
    expect(registrationText).toBeTruthy();
    const usernameInput = getByPlaceholderText('New Username');
    const passwordInput = getByPlaceholderText('New Password');
    const registerButton = getByTestId('createUserButton'); // Add a to your registration button
    expect(usernameInput).toBeTruthy();
    expect(passwordInput).toBeTruthy();
    expect(registerButton).toBeTruthy();
  });

  it('logs in and renders user dashboard when valid login credentials are provided', () => {
    const { getByText, getByPlaceholderText, getByTestId } = render(<App />);
    const usernameInput = getByPlaceholderText('Username');
    const passwordInput = getByPlaceholderText('Password');
    // Provide valid login credentials
    fireEvent.changeText(usernameInput, 'Test');
    fireEvent.changeText(passwordInput, 'test');
    const loginButton = getByTestId('userloginbutton');
    fireEvent.press(loginButton);
    setTimeout(() => {
      // Check if the welcome text is displayed after login
      const welcomeText = getByText('Welcome, Test!');
      expect(welcomeText).toBeTruthy();
    }, 1000); // Adjust the delay as needed
  });

  it('displays an error message when invalid login credentials are provided', () => {
    const { getByPlaceholderText, getByText, getByTestId } = render(<App />);
    const usernameInput = getByPlaceholderText('Username');
    const passwordInput = getByPlaceholderText('Password');
    const loginButton = getByTestId('userloginbutton'); // Add a testID to login button
    fireEvent.changeText(usernameInput, 'invalid-username');
    fireEvent.changeText(passwordInput, 'invalid-password');
    fireEvent.press(loginButton);
    setTimeout(() => {
    const errorMessage = getByText('Invalid username or password');
    expect(errorMessage).toBeTruthy();
    }, 1000); // Adjust the delay as needed
  });

  it('logs out when the "Logout" button is pressed', () => {
    const { getByText, getByTestId } = render(<App />);
    const usernameInput = getByPlaceholderText('Username');
    const passwordInput = getByPlaceholderText('Password');
    
    // Provide valid login credentials
    fireEvent.changeText(usernameInput, 'Test');
    fireEvent.changeText(passwordInput, 'test');
    const loginButton = getByTestId('userloginbutton');
    fireEvent.press(loginButton);
  
    // Use setTimeout to wait for the component to re-render after login (adjust the delay as needed)
    setTimeout(() => {
      // Check if the welcome text is displayed after login
      const welcomeText = getByText('Welcome, Test!');
      expect(welcomeText).toBeTruthy();
      
      // Locate the logout button and trigger a click event
      const logoutButton = getByText('Logout');
      fireEvent.press(logoutButton);
  
      // Use setTimeout to wait for the component to re-render after logout (adjust the delay as needed)
      setTimeout(() => {
        // Check if the login screen is displayed after logout
        const loginText = getByText('Login to the Fridge');
        expect(loginText).toBeTruthy();
      }, 1500); // Adjust the delay as needed for logout
    }, 1500); // Adjust the delay as needed for login
  });

  // Add more test cases as needed
  // ...

});