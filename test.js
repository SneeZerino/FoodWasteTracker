import React from 'react';
import { render, fireEvent, getByPlaceholderText, waitFor } from '@testing-library/react-native';
import { useRoute } from '@react-navigation/native';
import LoginScreen from './screens/LoginScreen';
import ShoppingListScreen from './screens/ShoppingListScreen';
import mockUseRoute from './mocks/useRoute';

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useRoute: () => mockUseRoute,
}));
describe('Login Screen Tests', () => {
  it('renders login screen by default', async () => {
    const { getByText } = render(<LoginScreen />);
    const loginText = getByText('Login to the Fridge');
    expect(loginText).toBeTruthy();
  });

  it('renders registration screen when "Create User" button is pressed', async () => {
    const { getByText, getByPlaceholderText, getByTestId } = render(<LoginScreen />);
  
    // Find and press the "Create User" button
    const createUserButton = getByText('Create User');
    fireEvent.press(createUserButton);
  
    // Verify that the registration form is displayed
    const registrationText = getByText('Register a new account:');
    expect(registrationText).toBeTruthy();
  
    // Verify the presence of registration form inputs and the registration button
    const firstNameInput = getByPlaceholderText('First Name');
    const lastNameInput = getByPlaceholderText('Last Name');
    const emailInput = getByPlaceholderText('Email');
    const usernameInput = getByPlaceholderText('New Username');
    const passwordInput = getByPlaceholderText('New Password');
    const registerButton = getByText('Register'); // Update the test ID to match your registration button
    expect(firstNameInput).toBeTruthy();
    expect(lastNameInput).toBeTruthy();
    expect(emailInput).toBeTruthy();
    expect(usernameInput).toBeTruthy();
    expect(passwordInput).toBeTruthy();
    expect(registerButton).toBeTruthy();
  });

  it('displays an error message when registration form is submitted with empty fields', async () => {
    const { getByText } = render(<LoginScreen />); // Render your LoginScreen component

    // Click the "Create User" button to switch to the registration form
    const createUserButton = getByText('Create User');
    fireEvent.press(createUserButton);

    // Find the "Register" button and click it
    const registerButton = getByText('Register');
    fireEvent.press(registerButton);

    // Find and assert the error message
    const errorMessage = getByText('Please fill out all required fields.');
    expect(errorMessage).toBeTruthy();
  });

  it('navigates to the main screen on successful login', async () => {
    const navigationMock = {
      navigate: jest.fn(),
    };

    const { getByText, getByPlaceholderText } = render(<LoginScreen navigation={navigationMock} />);

    // Simulate entering username and password
    const usernameInput = getByPlaceholderText('Username');
    fireEvent.changeText(usernameInput, 'Test');
    const passwordInput = getByPlaceholderText('Password');
    fireEvent.changeText(passwordInput, 'test');

    // Find and click the "Login" button
    const loginButton = getByText('Login');
    fireEvent.press(loginButton);

    await waitFor(() => {
      // Assert that the navigation function was called with the expected route name and params
      expect(navigationMock.navigate).toHaveBeenCalledWith('Main', { userId: 3 });
    });
  });
  });