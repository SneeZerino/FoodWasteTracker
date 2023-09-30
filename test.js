import React from 'react';
import { render, fireEvent, getByPlaceholderText, waitFor } from '@testing-library/react-native';
import App from './App';
import CommunityItemsScreen from './CommunityItemsScreen';

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

  it('logs out when the "Logout" button is pressed', async () => {
    const { getByText, getByTestId, getByPlaceholderText } = render(<App />);
    const usernameInput = getByPlaceholderText('Username');
    const passwordInput = getByPlaceholderText('Password');
    
    // Provide valid login credentials
    fireEvent.changeText(usernameInput, 'Test');
    fireEvent.changeText(passwordInput, 'test');
    const loginButton = getByTestId('userloginbutton');
    fireEvent.press(loginButton);
  
      // Wait for the login process to complete
  await waitFor(() => {
    // Check if the welcome text is displayed after login
    const welcomeText = getByText('Welcome, Test!');
    expect(welcomeText).toBeTruthy();
  });

  // Locate and click the logout button
  const logoutButton = getByText('Logout');
  fireEvent.press(logoutButton);

  // Wait for the logout process to complete
  await waitFor(() => {
    // Check if the login screen is displayed after logout
    const loginText = getByText('Login to the Fridge');
    expect(loginText).toBeTruthy();
  });
});

it('adds a product when the "Add Product" button is pressed', async () => {
  const { getByText, getByPlaceholderText, getByTestId } = render(<App />);
  const usernameInput = getByPlaceholderText('Username');
  const passwordInput = getByPlaceholderText('Password');
  // Provide valid login credentials
  fireEvent.changeText(usernameInput, 'Test');
  fireEvent.changeText(passwordInput, 'test');
  const loginButton = getByTestId('userloginbutton');
  fireEvent.press(loginButton);
  
  await waitFor(() => {
    // Check if the welcome text is displayed after login
    const welcomeText = getByText('Welcome, Test!');
    expect(welcomeText).toBeTruthy();
  });

  // Locate and click the "Add Groceries" button
  const addGroceriesButton = getByText('Add Groceries');
  fireEvent.press(addGroceriesButton);

  // Wait for the Add Groceries modal to be visible
  await waitFor(() => {
    const addModal = getByText('Add Groceries');
    expect(addModal).toBeTruthy();
  });

  // Locate and click the "Add Manually" button
  const addManuallyButton = getByText('Add Manually');
  fireEvent.press(addManuallyButton);

  // Wait for the Add Product Manually modal to be visible
  await waitFor(() => {
    const addProductModal = getByText('Add Product Manually');
    expect(addProductModal).toBeTruthy();
  });

  // Locate and fill in the product name and expiry date inputs
  const productNameInput = getByPlaceholderText('Product Name');
  const expiryDateInput = getByPlaceholderText('Expiry Date (YYYY-MM-DD)');
  fireEvent.changeText(productNameInput, 'Test Product');
  fireEvent.changeText(expiryDateInput, '2023-12-31');

  // Locate and click the "Add Product" button
  const addProductButton = getByText('Add Product');
  fireEvent.press(addProductButton);

  // Locate and click the logout button
  const logoutButton = getByText('Logout');
  fireEvent.press(logoutButton);

  // Wait for the logout process to complete
  await waitFor(() => {
    // Check if the login screen is displayed after logout
    const loginText = getByText('Login to the Fridge');
    expect(loginText).toBeTruthy();
  });
});

  // Add more test cases as needed
  // ...

});