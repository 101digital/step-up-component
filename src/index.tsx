import React from 'react';
import { View } from 'react-native';
import {
    CardStyleInterpolators,
    createStackNavigator,
    StackNavigationProp,
  } from '@react-navigation/stack';

const Stack = createStackNavigator();

export default function StepUpMainStack() {
    return (
      <Stack.Navigator>
        <Stack.Screen name="Biometric" component={() => <View />} />
        <Stack.Screen name="Notifications" component={() => <View />} />
      </Stack.Navigator>
    );
  }