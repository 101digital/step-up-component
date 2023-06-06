import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  NativeEventEmitter,
  NativeModules,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, fonts } from './assets';
import { PinNumberComponent } from 'react-native-theme-component';
import { OTPFieldRef } from 'react-native-theme-component/src/otp-field';
import SInfo from 'react-native-sensitive-info';
import { GoBackArrowIcon } from './assets/icons/go-back-arrow.icon';
import { StepUpContext } from './context/stepup-context';
import StepUpUtils from './service/utils';

export type StepUpScreenParams = {
  onFailedVerified?: () => void;
  onSuccessVerified?: () => void;
  onVerifying?: () => void;
};

export const PASSWORD_LOCKED_OUT = 'PASSWORD_LOCKED_OUT';
export const BIOMETRIC_CHANGE = 'BIOMETRIC_CHANGE';

export default function StepUpComponent({ navigation, route }: any) {
  const otpRef = useRef<OTPFieldRef>();
  const { obtainNewAccessToken, saveResumeURL, resumeURL } =
    useContext(StepUpContext);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isNotMatched, setIsNotMatched] = useState<boolean>(false);
  const { PingOnesdkModule } = NativeModules;
  const { onFailedVerified, onSuccessVerified, onVerifying } = route.params;
  const [isBiometricEnabled, setIsBiometricEnabled] = useState<boolean>(false);

  const verifyBiometric = async () => {
    if (isBiometricEnabled) {
      setIsLoading(true);
      PingOnesdkModule.setCurrentSessionId('');
      try {
        const hasAnySensors = await SInfo.isSensorAvailable();
        if (hasAnySensors) {
          const authorizeResponse = await StepUpUtils.validateBiometric();
          if (authorizeResponse) {
            onVerifying();
            if (authorizeResponse.resumeUrl && authorizeResponse.authSession) {
              PingOnesdkModule.setCurrentSessionId(
                authorizeResponse.authSession.id
              );
              saveResumeURL(authorizeResponse.resumeUrl);
              return;
            }
          }
        }
        onFailedVerified();
      } catch (error) {
        onFailedVerified();
      }
    }
  };

  const validatePINNumber = async (otpNumber: string) => {
    PingOnesdkModule.setCurrentSessionId('');
    setIsLoading(true);
    const authorizeResponse = await StepUpUtils.validatePin(otpNumber);
    if (!authorizeResponse) {
      setIsLoading(false);
      setIsNotMatched(true);
      onFailedVerified();
    } else {
      onVerifying();
      if (authorizeResponse?.status === 'FAILED') {
        setIsLoading(false);
        onFailedVerified(authorizeResponse.error);
      } else if (
        authorizeResponse.authSession &&
        authorizeResponse?.resumeUrl
      ) {
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
        if (event?.push_approved) {
          const isSuccess = await obtainNewAccessToken();
          if (isSuccess) {
            navigation.goBack();
            onSuccessVerified();
          } else {
            navigation.goBack();
            onFailedVerified();
          }
        } else {
          navigation.goBack();
          onFailedVerified();
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

  useEffect(() => {
    StepUpUtils.getIsEnableBiometric().then((isEnabled) => {
      if (isEnabled && JSON.parse(isEnabled)) {
        setIsBiometricEnabled(true);
      }
    });
  }, []);

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
          onValidateBiometric={verifyBiometric}
          onValidatePin={validatePINNumber}
          isBiometricEnable={isBiometricEnabled}
          showError={isNotMatched}
          errorMessage={'PIN is incorrect'}
          isProcessing={onVerifying ? false : isLoading}
        />
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
