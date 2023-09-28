module.exports = {
  preset: 'react-native',
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$',
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|react-navigation|@react-navigation/.*|@react-navigation/.*\\/node_modules/react-native|react-navigation-stack|react-navigation-tabs|react-native-gesture-handler)',
  ],
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': require.resolve('babel-jest'), // Use Babel for JavaScript and TypeScript files
  },
};
