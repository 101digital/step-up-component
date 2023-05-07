import React from 'react';
import { View } from 'react-native';
import {
    CardStyleInterpolators,
    createStackNavigator,
    StackNavigationProp,
  } from '@react-navigation/stack';
import Route from 'step-up-component/src/route';

const Stack = createStackNavigator();

export default function StepUpMainStack() {
    return (
      <Stack.Navigator>
        <Stack.Screen name={Route.BIOMETRIC_VERIFICATION} component={() => <View />} />
        <Stack.Screen name={Route.PIN_VERIFICATION} component={() => <View />} />
      </Stack.Navigator>
    );
  }