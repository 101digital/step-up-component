jest.mock('react-native-auth-component', () => {
    return () => ({});
});
jest.mock('react-native-aes-crypto', () => {
    return () => ({});
});
jest.mock('react-native-sha256', () => {
    return () => ({});
});
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);