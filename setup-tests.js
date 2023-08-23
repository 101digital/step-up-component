import React from 'react';
import { AuthContext } from 'react-native-auth-component';

jest.mock('react-native-auth-component', () => {
    return () => ({});
});
jest.mock('react-native-aes-crypto', () => {
    return () => ({});
});
jest.mock('react-native-sha256', () => {
    return () => ({});
});
  