import { render, fireEvent, waitFor } from '@testing-library/react-native';
import App from './App';

test('user can log in', async () => {
  const { getByPlaceholderText, getByText, getByTestId } = render(<App />);
  
  const usernameInput = getByPlaceholderText('Username');
  const passwordInput = getByPlaceholderText('Password');
  const loginButton = getByTestId('userloginbutton');

  // Simulate user input
  fireEvent.changeText(usernameInput, 'Test');
  fireEvent.changeText(passwordInput, 'test');

  // Trigger the login action
  fireEvent.press(loginButton);

  // Use waitFor to wait for asynchronous changes
  await waitFor(() => {
    // Assert that the user is logged in
    const welcomeText = getByText('Welcome, Test!');
    expect(welcomeText).toBeTruthy();
  });

});
