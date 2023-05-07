import { StyleSheet, SafeAreaView, View } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import {
  AuthContext,
  VerificationMethod,
  ADBLoginWithPINComponent,
} from 'react-native-auth-component';
import AlertModal from '@/screens/adb/components/alert-modal';
import { AlertIcon } from '@/assets/icons';
import AppComponentStore from '../../../helpers/local-store';
import { AppContext } from '@/context/AppContext';

export type ADBLoginWithPINScreenParams = {};

const ADBLoginWithPINScreen = () => {
  const { setIsValidatedSubsequenceLogin, setVerificationMethodKey } = useContext(AuthContext);
  const { handlerError } = useContext(AppContext);
  const [isShowPinFailed, setIsShowPinFailed] = useState<boolean>(false);
  const [isSkipVerifyPush, setIsSkipVerifyPush] = useState<boolean>(false);

  const onFailedVerified = () => {
    setIsValidatedSubsequenceLogin(false);
    setIsShowPinFailed(true);
  };

  const onSuccessVerified = async () => {
    // setIsValidatedSubsequenceLogin(true);
  };

  const getSkipSMSOTP = async () => {
    const isSkipSMSOTP = await AppComponentStore.getIsSkipVerifyOTPMobileNumber();
    setIsSkipVerifyPush(isSkipSMSOTP === 'enabled');
  };

  useEffect(() => {
    getSkipSMSOTP();
  }, []);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ADBLoginWithPINComponent
          onFailedVerified={onFailedVerified}
          onSuccessVerified={onSuccessVerified}
          isSkipSMSOTP={isSkipVerifyPush}
          onError={handlerError}
        />
      </SafeAreaView>
      <AlertModal
        title={'Oops! Wrong PIN'}
        message={'You’ve entered the wrong PIN 3 times. Please use your password to log in.'}
        isVisible={isShowPinFailed}
        icon={<AlertIcon size={70} />}
        onConfirmBtnPress={() => {
          setIsShowPinFailed(false);
          setVerificationMethodKey(VerificationMethod.PASSWORD);
        }}
        btnLabel={'Use password'}
      />
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
  },
});

export default ADBLoginWithPINScreen;
