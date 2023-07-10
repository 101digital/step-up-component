import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  NativeEventEmitter,
  NativeModules,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions
} from "react-native";
import { colors, fonts } from "./assets";
import {
  ADBAlertModal,
  LoadingModal,
  PinNumberComponent,
  ThemeContext
} from "react-native-theme-component";
import { OTPFieldRef } from "react-native-theme-component/src/otp-field";
import SInfo from "react-native-sensitive-info";
import { ADBBackArrowIcon } from "@/assets/icons";
import { StepUpContext } from "./context/stepup-context";
import StepUpUtils from "./service/utils";
import { AuthContext } from "react-native-auth-component";

export type StepUpScreenParams = {
  onFailedBiometric?: () => void;
  onFailedVerified?: () => void;
  onSuccessVerified?: () => void;
  onVerifying?: () => void;
  onBack?: () => void;
  onFailedTitle?: string;
  onFailedSubTitle?: string;
  onFailedBtnTitle?: string;
};

export const PASSWORD_LOCKED_OUT = "PASSWORD_LOCKED_OUT";
export const BIOMETRIC_CHANGE = "BIOMETRIC_CHANGE";

export default function StepUpComponent({ navigation, route }: any) {
  const otpRef = useRef<OTPFieldRef>();
  const { obtainNewAccessToken, saveResumeURL, resumeURL } = useContext(
    StepUpContext
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isNotMatched, setIsNotMatched] = useState<boolean>(false);
  const { PingOnesdkModule } = NativeModules;
  const {
    onFailedVerified,
    onSuccessVerified,
    onVerifying,
    onBack,
    onFailedTitle,
    onFailedSubTitle,
    onFailedBtnTitle
  } = route.params;
  const [isBiometricEnabled, setIsBiometricEnabled] = useState<boolean>(false);
  const [validateAttempt, setValidateAttempt] = useState<number>(1);
  const [isShowErrorPinPopup, setIsShowErrorPinPopup] = useState<boolean>(
    false
  );
  const { setIsSignedIn } = useContext(AuthContext);
  const { i18n } = useContext(ThemeContext);
  const windowWidth = Dimensions.get("window").width;

  const verifyBiometric = async (isEnabled?: true) => {
    if (isEnabled || isBiometricEnabled) {
      setIsLoading(true);
      PingOnesdkModule.setCurrentSessionId("");
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
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
      }
    }
  };

  const validatePINNumber = async (otpNumber: string) => {
    PingOnesdkModule.setCurrentSessionId("");
    setIsLoading(true);
    const authorizeResponse = await StepUpUtils.validatePin(otpNumber);
    if (!authorizeResponse) {
      setIsLoading(false);
      setIsNotMatched(true);
      setValidateAttempt(validateAttempt + 1);
      otpRef.current?.clearInput();
      onFailedVerified();
    } else {
      onVerifying();
      if (authorizeResponse?.status === "FAILED") {
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
      "ping_push_event",
      async event => {
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
    onBack?.();
  };

  useEffect(() => {
    checkDeviceBinding();
    runSubsequentLoginFlow();
  }, []);

  const runSubsequentLoginFlow = async () => {
    const isEnabled = await StepUpUtils.getIsEnableBiometric();
    if (isEnabled && JSON.parse(isEnabled)) {
      setIsBiometricEnabled(true);
      await verifyBiometric(true);
    }
  };

  const checkDeviceBinding = async () => {
    const isDeviceBinded = await PingOnesdkModule.isDeviceBinded();
    if (
      !isDeviceBinded ||
      (Platform.OS === "ios" && JSON.parse(isDeviceBinded) === false)
    ) {
      Alert.alert(
        i18n.t("stepup.ping_device_deleted_title") ?? "Ping Binding Deleted",
        i18n.t("stepup.ping_device_deleted_title_message") ??
          "This device no longer binded with your account, perhaps this is fresh install or you used the connected account in another device recently or your account is hard rejected, if not then please raise a bug."
      );
      setIsSignedIn(false);
      return;
    }
  };

  const onPressGoBack = () => {
    setIsShowErrorPinPopup(false);
    onGoBack();
  };

  useEffect(() => {
    if (validateAttempt > 3) {
      setIsShowErrorPinPopup(true);
    }
  }, [validateAttempt]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.wrapper}>
        <View style={styles.header}>
          <View style={styles.navigationSection}>
            <TouchableOpacity onPress={onGoBack}>
              <ADBBackArrowIcon size={20} color={colors.primaryHifiColor} />
            </TouchableOpacity>
          </View>
          <Text style={styles.title}>
            {i18n.t("stepup.title") ?? "Enter your 6-digit PIN"}
          </Text>
          <Text style={styles.subTitle}>
            {i18n.t("stepup.sub_title") ??
              "Enter your 6-digit PIN to continue."}
          </Text>
        </View>
        <View
          style={{ flex: 1, maxWidth: windowWidth - 50, marginHorizontal: 25 }}
        >
          <PinNumberComponent
            key={"PinInput"}
            ref={otpRef}
            onValidateBiometric={verifyBiometric}
            onValidatePin={validatePINNumber}
            clearError={() => setIsNotMatched(false)}
            isBiometricEnable={isBiometricEnabled}
            showError={isNotMatched}
            errorMessage={
              i18n.t("stepup.invalid_pin_message") ??
              "Invalid PIN. Please try again."
            }
            isProcessing={false}
          />
        </View>
        <ADBAlertModal
          title={
            onFailedTitle ??
            i18n.t("stepup.validate_failed_title_message") ??
            "Oops! Wrong PIN"
          }
          message={
            onFailedSubTitle ??
            i18n.t("stepup.validate_failed_subtitle_message") ??
            "You’ve entered the wrong PIN too many times. Please try again later."
          }
          onConfirmBtnPress={onPressGoBack}
          btnLabel={
            onFailedBtnTitle ??
            i18n.t("stepup.go_back_btn_message") ??
            "Go back"
          }
          isVisible={isShowErrorPinPopup}
        />
      </KeyboardAvoidingView>
      {isLoading && <LoadingModal shouldShow={isLoading} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  wrapper: {
    flex: 1,
    marginBottom: 15
  },
  title: {
    fontSize: 24,
    color: "#1B1B1B",
    fontFamily: fonts.semiBold
  },
  subTitle: {
    fontSize: 14,
    color: "#1B1B1B",
    fontFamily: fonts.regular,
    marginTop: 14
  },
  navigationSection: {
    marginBottom: 27
  },
  header: {
    marginHorizontal: 25,
    marginTop: 24
  },
  bottomSection: {
    marginBottom: 15
  },
  flex: {
    flex: 1
  },
  actions: {
    marginHorizontal: 20
  },
  rowSpaceBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  validContainer: {
    marginTop: 15
  },
  validationLabel: {
    marginLeft: 6
  },
  rowItemValid: {
    marginVertical: 5,
    flexDirection: "row",
    alignItems: "center"
  },
  errorWrapper: {
    alignItems: "center"
  },
  errorText: {
    color: "#020000",
    marginLeft: 7
  },
  imagePlaceHolderContainer: {
    alignItems: "center",
    justifyContent: "space-around",
    marginTop: 55,
    marginBottom: 75
  },
  imagePlaceHolderWrapper: {
    height: 80,
    width: 80,
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "#D9D9D9",
    borderRadius: 80
  },
  iconBtn: {
    marginRight: 10
  },
  buttonAction: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#333",
    marginBottom: 15
  },
  content: {
    flex: 1,
    paddingHorizontal: 20
  },
  rowCenter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginTop: 30
  },
  pinTitle: {
    color: "#858585",
    fontSize: 12
  },
  cameraDisableContainer: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 24
  },
  gap16: {
    height: 16
  },
  gap40: {
    height: 40
  },
  gap8: {
    height: 8
  },
  loginTitle: {
    fontSize: 24,
    color: colors.primaryBlack,
    fontFamily: fonts.semiBold
  }
});
