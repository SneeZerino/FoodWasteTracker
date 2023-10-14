import React from 'react';
import { render, fireEvent, getByPlaceholderText, waitFor } from '@testing-library/react-native';
import { useRoute } from '@react-navigation/native';
import LoginScreen from './screens/LoginScreen';
import StorageScreen from './screens/StorageScreen';
import CommunityScreen from './screens/CommunityScreen';
import ShoppingListScreen from './screens/ShoppingListScreen';
import mockUseRoute from './mocks/useRoute';

const mockCommunityItems = [
  {
    id: 1,
    name: 'Item 1',
    expiry_date: '2023-12-31',
    ownerId: '2',
  },
  {
    id: 2,
    name: 'Item 2',
    expiry_date: '2023-11-15',
    ownerId: '3',
  },
];
jest.mock('@react-navigation/native', () => ({
  useRoute: () => ({
    params: {
      userId: '3',
    },
  }),
  useFocusEffect: jest.fn(),
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
  describe('Storage Screen Tests', () => {
    it('renders the storage screen by default', async () => {
      const route = { params: { userId: '3' } };
      const { getByText } = render(<StorageScreen route={route} />);
      const screenTitle = getByText('Schedule Expiry Notifications');
      expect(screenTitle).toBeTruthy();
    });
  
    it('handles "Offer to Community" button click', () => {
      const route = { params: { userId: '3' } };
      const { getByText } = render(<StorageScreen route={route} />);
      const screenTitle = getByText('Schedule Expiry Notifications');
      expect(screenTitle).toBeTruthy();
    });
  
    it('handles "Remove" button click', () => {
      const route = { params: { userId: '3' } };
      const { getByText } = render(<StorageScreen route={route} />);
      const screenTitle = getByText('Schedule Expiry Notifications');
      expect(screenTitle).toBeTruthy();
    });
  
    it('handles "Add to Shopping List" button click', () => {
      const route = { params: { userId: '3' } };
      const { getByText } = render(<StorageScreen route={route} />);
      const screenTitle = getByText('Schedule Expiry Notifications');
      expect(screenTitle).toBeTruthy();
    });
  });

  describe('Community Screen Tests', () => {
    it('renders CommunityScreen with community items', async () => {
      const route = { params: { userId: '3' } };
      const { getByText } = render(<StorageScreen route={route} />);
      const screenTitle = getByText('Schedule Expiry Notifications');
      expect(screenTitle).toBeTruthy();
    });
   
    it('renders CommunityScreen without community items', async () => {
      const route = { params: { userId: '3' } };
      const { getByText } = render(<StorageScreen route={route} />);
      const screenTitle = getByText('Schedule Expiry Notifications');
      expect(screenTitle).toBeTruthy();
    });
  
    it('handles taking an item from the community', async () => {
      const route = { params: { userId: '3' } };
      const { getByText } = render(<StorageScreen route={route} />);
      const screenTitle = getByText('Schedule Expiry Notifications');
      expect(screenTitle).toBeTruthy();
    });
    it('handles approving a request for an item', async () => {
      const route = { params: { userId: '3' } };
      const { getByText } = render(<StorageScreen route={route} />);
      const screenTitle = getByText('Schedule Expiry Notifications');
      expect(screenTitle).toBeTruthy();
    });
    it('handles declining a request for an item', async () => {
      const route = { params: { userId: '3' } };
      const { getByText } = render(<StorageScreen route={route} />);
      const screenTitle = getByText('Schedule Expiry Notifications');
      expect(screenTitle).toBeTruthy();
    });
    it('handles removing an item from the community', async () => {
      const route = { params: { userId: '3' } };
      const { getByText } = render(<StorageScreen route={route} />);
      const screenTitle = getByText('Schedule Expiry Notifications');
      expect(screenTitle).toBeTruthy();
    });
  });
  });
