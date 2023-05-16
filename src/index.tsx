import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  NativeEventEmitter,
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
  ThemeContext,
  AlertCircleIcon,
  PinNumberComponent,
} from 'react-native-theme-component';
import { OTPFieldRef } from 'react-native-theme-component/src/otp-field';
import SInfo from 'react-native-sensitive-info';
import BottomSheetModal from 'react-native-theme-component/src/bottom-sheet';
import { GoBackArrowIcon } from './assets/icons/go-back-arrow.icon';
import StepUpUtils from './service/utils';
import { StepUpContext } from './context/stepup-context';

export type StepUpScreenParams = {
  onFailedVerified?: () => void;
  onSuccessVerified?: () => void;
};

export const PASSWORD_LOCKED_OUT = 'PASSWORD_LOCKED_OUT';
export const BIOMETRIC_CHANGE = 'BIOMETRIC_CHANGE';

export default function StepUpComponent({ navigation, route }: any) {
  const otpRef = useRef<OTPFieldRef>();
  const { obtainNewAccessToken, saveResumeURL, resumeURL } =
    useContext(StepUpContext);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [keyboardHeight, setKeyboardHeight] = useState<number>(0);
  const [isNotMatched, setIsNotMatched] = useState<boolean>(false);
  const { PingOnesdkModule } = NativeModules;
  const { onFailedVerified, onSuccessVerified } = route.params;
  const marginKeyboard = keyboardHeight
    ? keyboardHeight - 20
    : Platform.OS === 'ios'
    ? 0
    : 20;

  const verifyBiometric = async () => {
    const isEnabled = await StepUpUtils.getIsEnableBiometric();
    if (isEnabled && JSON.parse(isEnabled)) {
      try {
        const hasAnySensors = await SInfo.isSensorAvailable();
        if (hasAnySensors) {
          const authorizeResponse = await StepUpUtils.validateBiometric();

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
              if (authorizeResponse.error.code === PASSWORD_LOCKED_OUT) {
                console.log(PASSWORD_LOCKED_OUT);
              } else if (authorizeResponse.error.code === BIOMETRIC_CHANGE) {
                console.log(BIOMETRIC_CHANGE);
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

  const validatePINNumber = async (otpNumber) => {
    setIsLoading(true);
    const authorizeResponse = await StepUpUtils.validatePin(otpNumber);
    console.log('validatePINNumber -> authorizeResponse', authorizeResponse);
    if (!authorizeResponse) {
      setIsLoading(false);
      setIsNotMatched(true);
    } else {
      if (authorizeResponse?.status === 'FAILED') {
        onFailedVerified(authorizeResponse.error);
      } else if (
        authorizeResponse.authSession &&
        authorizeResponse?.resumeUrl
      ) {
        console.log(
          'authorizeResponse.authSession.id',
          authorizeResponse.authSession.id
        );
        saveResumeURL(authorizeResponse.resumeUrl);
        PingOnesdkModule.setCurrentSessionId(authorizeResponse.authSession.id);
      }
    }
  };

  useEffect(() => {
    const eventEmitter = new NativeEventEmitter(NativeModules.PingOnesdkModule);
    const pingPushListener = eventEmitter.addListener(
      'ping_push_event',
      async (event) => {
        Alert.alert(
          'Ping Push Auth:',
          event?.push_approved ? 'Approved' : 'Denied/Failed'
        );
        if (event?.push_approved) {
          const isSuccess = await obtainNewAccessToken();
          console.log('obtainNewAccessToken -> isSuccess', isSuccess);
          if (isSuccess) {
            navigation.goBack();
            setTimeout(() => {
              onSuccessVerified();
            }, 500);
          } else {
          }
        } else {
        }
      }
    );

    return () => {
      pingPushListener.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeURL]);

  const onGoBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.navigationSection}>
            <TouchableOpacity onPress={onGoBack}>
              <GoBackArrowIcon size={20} />
            </TouchableOpacity>
          </View>
          <Text style={styles.title}>{'Enter your 6-digit PIN'}</Text>
          <Text style={styles.subTitle}>
            {'Enter your 6-digit PIN to continue.'}
          </Text>
        </View>
        <PinNumberComponent
          key={'PinInput'}
          ref={otpRef}
          onPressNext={validatePINNumber}
          isBiometricEnable={false}
          showError={isNotMatched}
          errorMessage={'PIN is incorrect'}
          isProcessing={isLoading}
        />
        {/* <View style={styles.content}>
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
                <Text style={styles.errorText}>{`PIN is incorrect`}</Text>
              </View>
            </View>
          )}
        </View> */}
        {/* <View style={[styles.actions, { marginBottom: marginKeyboard }]}>
          <ADBButton
            label={'Continue'}
            disabled={value.length < 6}
            onPress={validatePINNumber}
            isLoading={isLoading}
          />
        </View> */}
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
