module.exports = {
  preset: 'react-native',
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$',
  transformIgnorePatterns: ['node_modules/(?!(jest-)?react-native|@react-native|react-navigation|@react-navigation/.*|@react-navigation/.*\\/node_modules/react-native|react-navigation-stack|react-navigation-tabs|react-native-gesture-handler)',],
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  transform: {'^.+\\.(js|jsx|ts|tsx)$': require.resolve('babel-jest'),},
  "setupFiles": [
    "./jest.setup.js"
  ],
  moduleNameMapper: {
    'expo-device': '<rootDir>/mocks/expo-device.js', // Mocked module path
    'expo-notifications': '<rootDir>/mocks/expo-notifications.js', // Mocked module path
    'expo-constants': '<rootDir>/mocks/expo-constants.js', // Mocked module path
    '^react-navigation/native$': '<rootDir>/mocks/react-navigation-native.js', // Mock for react-navigation
    '^react-navigation-stack$': '<rootDir>/mocks/react-navigation-stack.js', // Mock for react-navigation-stack
    '^@react-navigation/native-stack$': '<rootDir>/mocks/react-navigation-native-stack.js', // Mock for @react-navigation/native-stack
    '^@react-navigation/stack$': '<rootDir>/mocks/react-navigation-stack.js', // Mock for @react-navigation/stack
    '^@expo/vector-icons$': '<rootDir>/mocks/expo-vector-icons.js', // Mock for Expo Vector Icons
  },
};
