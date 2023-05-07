import React from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, View } from 'react-native';

export type BiometricVerificationScreenParams = {};

const BiometricVerificationScreen = () => {
  return (
    <View style={StyleSheet.absoluteFill}>
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ActivityIndicator size={50} />
        </SafeAreaView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
});

export default BiometricVerificationScreen;
