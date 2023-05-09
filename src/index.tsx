import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  NativeModules,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, fonts } from './assets';
import {
  ADBButton,
  OTPField,
  TriangelDangerIcon,
  ImageIcon,
  ThemeContext,
  AlertCircleIcon,
} from 'react-native-theme-component';
import { OTPFieldRef } from 'react-native-theme-component/src/otp-field';
import {
  authComponentStore,
  AuthContext,
  VerificationMethod,
} from 'react-native-auth-component';
import SInfo from 'react-native-sensitive-info';
import BottomSheetModal from 'react-native-theme-component/src/bottom-sheet';
import { useTheme } from '@react-navigation/native';
import { GoBackArrowIcon } from './assets/icons/go-back-arrow.icon';

type StepUpComponentProps = {
  onFailedVerified: () => void;
  onSuccessVerified: () => void;
  onError: (err: Error) => void;
  onBack: () => void;
};

export default function StepUpComponent(props: StepUpComponentProps) {
  const otpRef = useRef<OTPFieldRef>();
  const [value, setValue] = useState<string>('');
  const { i18n } = useContext(ThemeContext);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [keyboardHeight, setKeyboardHeight] = useState<number>(0);
  const [isNotMatched, setIsNotMatched] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);
  const { PingOnesdkModule } = NativeModules;
  const [errorModal, setErrorModal] = useState(false);
  const { onFailedVerified, onSuccessVerified, onError, onBack } = props;
  const marginKeyboard = keyboardHeight
    ? keyboardHeight - 20
    : Platform.OS === 'ios'
    ? 0
    : 20;

  const verifyBiometric = async () => {
    const isEnabled = await authComponentStore.getIsEnableBiometric();
    if (isEnabled && JSON.parse(isEnabled)) {
      try {
        const hasAnySensors = await SInfo.isSensorAvailable();
        if (hasAnySensors) {
          const authorizeResponse =
            await authComponentStore.validateBiometric();

          if (authorizeResponse) {
            if (
              authorizeResponse.resumeUrl &&
              authorizeResponse.authSession &&
              authorizeResponse.selectedDevice?.id
            ) {
              PingOnesdkModule.setCurrentSessionId(
                authorizeResponse.authSession.id
              );
            } else if (
              authorizeResponse.error &&
              authorizeResponse.error.code
            ) {
              if (authorizeResponse.error.code === 'PASSWORD_LOCKED_OUT') {
                console.log('PASSWORD_LOCKED_OUT');
              } else if (authorizeResponse.error.code === 'BIOMETRIC_CHANGE') {
                console.log('BIOMETRIC_CHANGE');
              }
            } else {
              console.log('on error 1');
            }
            return;
          }
        }
      } catch (error) {
        console.log('on error 2');
      }
    } else {
      otpRef.current?.focus();
    }
  };

  useEffect(() => {
    verifyBiometric();
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e) => {
        console.log('event', e);
        setKeyboardHeight(e.endCoordinates.height);
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );
    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const validatePINNumber = async () => {
    setIsLoading(true);
    // const authorizeResponse = await authComponentStore.validatePin(value);
    // if (!authorizeResponse) {
    //   setIsLoading(false);
    //   if (retryCount + 1 < 3) {
    //     setIsNotMatched(true);
    //     setRetryCount(retryCount + 1);
    //     otpRef.current?.clearInput();
    //     otpRef.current?.focus();
    //   } else {
    //     onFailedVerified();
    //   }
    // } else {
    //   if (authorizeResponse?.status === 'FAILED') {
    //     setIsLoading(false);
    //     authComponentStore.storeIsUserLogged(false);
    //     setIsNotMatched(false);
    //     setRetryCount(0);
    //   } else if (authorizeResponse.authSession && authorizeResponse?.resumeUrl) {
    // const deviceId = await authComponentStore.getDeviceId();
    // const selectedDeviceId = authorizeResponse.selectedDevice?.id;

    // if (deviceId !== selectedDeviceId) {
    //   setIsSignedIn(false);
    //   authComponentStore.storeIsUserLogged(false);
    // } else {
    // PingOnesdkModule.setCurrentSessionId(authorizeResponse.authSession.id);
    // saveResumeURL(authorizeResponse?.resumeUrl);
    // onSuccessVerified();
    // }
    // }
    // }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.navigationSection}>
            <TouchableOpacity onPress={onBack}>
              <GoBackArrowIcon size={20} />
            </TouchableOpacity>
          </View>
          <Text style={styles.title}>{'Enter your 6-digit PIN'}</Text>
          <Text style={styles.subTitle}>
            {'Enter your 6-digit PIN to continue.'}
          </Text>
        </View>
        <View style={styles.content}>
          <OTPField
            ref={otpRef}
            cellCount={6}
            onChanged={setValue}
            style={{
              focusCellContainerStyle: { borderBottomColor: '#1EBCE8' },
            }}
            isUnMasked={false}
          />

          {isNotMatched && (
            <View style={styles.errorWrapper}>
              <View style={styles.rowCenter}>
                <TriangelDangerIcon size={20} />
                <Text style={styles.errorText}>{`PIN is incorrect. You have ${
                  3 - retryCount
                } remaining attempts.`}</Text>
              </View>
            </View>
          )}
        </View>
        <View style={[styles.actions, { marginBottom: marginKeyboard }]}>
          <ADBButton
            label={'Continue'}
            disabled={value.length < 6}
            onPress={validatePINNumber}
            isLoading={isLoading}
          />
        </View>
        <BottomSheetModal isVisible={errorModal}>
          <View style={styles.cameraDisableContainer}>
            <AlertCircleIcon size={72} />
            <View style={styles.gap40} />
            <Text style={[styles.loginTitle, { textAlign: 'center' }]}>
              {i18n.t('login_component.lbl_account_locked') ??
                `Oops! Your account is temporarily locked`}
            </Text>
            <View style={styles.gap8} />
            <Text style={[styles.subTitle, { textAlign: 'center' }]}>
              {i18n.t('login_component.lbl_entered_wrong_password') ??
                `You’ve entered the wrong credentials too many times. Please try again after 1 hour.`}
            </Text>
            <View style={{ height: 32 }} />
            <ADBButton
              label={i18n.t('login_component.btn_done') ?? 'Done'}
              onPress={() => {
                setErrorModal(false);
              }}
            />
          </View>
        </BottomSheetModal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    color: '#1B1B1B',
    fontFamily: fonts.semiBold,
  },
  subTitle: {
    fontSize: 14,
    color: '#1B1B1B',
    fontFamily: fonts.regular,
    marginTop: 14,
  },
  navigationSection: {
    marginBottom: 27,
  },
  header: {
    marginHorizontal: 25,
    marginTop: 24,
  },
  bottomSection: {
    marginBottom: 15,
  },
  flex: {
    flex: 1,
  },
  actions: {
    marginHorizontal: 20,
  },
  rowSpaceBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  validContainer: {
    marginTop: 15,
  },
  validationLabel: {
    marginLeft: 6,
  },
  rowItemValid: {
    marginVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorWrapper: {
    alignItems: 'center',
  },
  errorText: {
    color: '#020000',
    marginLeft: 7,
  },
  imagePlaceHolderContainer: {
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 55,
    marginBottom: 75,
  },
  imagePlaceHolderWrapper: {
    height: 80,
    width: 80,
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#D9D9D9',
    borderRadius: 80,
  },
  iconBtn: {
    marginRight: 10,
  },
  buttonAction: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 15,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 30,
  },
  pinTitle: {
    color: '#858585',
    fontSize: 12,
  },
  cameraDisableContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 24,
  },
  gap16: {
    height: 16,
  },
  gap40: {
    height: 40,
  },
  gap8: {
    height: 8,
  },
  loginTitle: {
    fontSize: 24,
    color: colors.primaryBlack,
    fontFamily: fonts.semiBold,
  },
});
