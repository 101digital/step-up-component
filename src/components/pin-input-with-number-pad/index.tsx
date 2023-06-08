import React, {
  forwardRef,
  useContext,
  useCallback,
  useMemo,
  useEffect,
  memo,
  useState,
  useImperativeHandle,
} from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { DeleteIcon, FaceIcon, TriangelDangerIcon, CrossIcon, LoadingModal, ThemeContext } from 'react-native-theme-component';
import mergeStyle, { AppPasscodeCompStyle } from './styles';

export interface AppPassCodeProps {
  style?: AppPasscodeCompStyle;
  isVisible?: boolean;
  isBiometricEnable: boolean;
  isProcessing: boolean;
  showError?: boolean;
  errorMessage?: string;
  onValidateBiometric: () => void;
  onValidatePin: (e: string) => void;
}

export type OTPFieldRef = {
  clearInput: () => void;
};

const PinNumberComponent = forwardRef((props: AppPassCodeProps, ref) => {
  const {
    style,
    isBiometricEnable,
    isProcessing,
    showError,
    errorMessage,
    onValidateBiometric,
    onValidatePin,
  } = props;
  const styles: AppPasscodeCompStyle = mergeStyle(style);
  const [userVal, setUserVal] = useState('');
  const { i18n, colors } = useContext(ThemeContext);

  useImperativeHandle(
    ref,
    (): OTPFieldRef => ({
      clearInput: () => {
        setUserVal('');
      },
    })
  );

  const Buttons = memo(({ onPress, LeftIcon, RightIcon }) => {
    const data = useMemo(() => [...Array(12).keys()], []);

    const renderButton = useCallback(
      (i: number) => {
        const onPressButton = () =>
          onPress(i === 9 ? 'biometrics' : i === 10 ? '0' : i === 11 ? 'X' : i + 1);

        const backgroundColor = i === 9 || i === 11 ? 'transparent' : colors.primaryColor;

        const content =
          i === 9 ? (
            <View>{LeftIcon ? LeftIcon : null}</View>
          ) : i === 11 ? (
            <View>{RightIcon ? RightIcon : <CrossIcon />}</View>
          ) : (
            <Text style={styles.buttonTextContainer}>{i === 10 ? 0 : i + 1}</Text>
          );

        const MemoizedContent = memo(() => content);

        return (
          <TouchableOpacity
            onPress={onPressButton}
            style={[styles.buttonContainer, { backgroundColor }]}
            key={i}
          >
            <MemoizedContent />
          </TouchableOpacity>
        );
      },
      [colors.primaryColor, onPress, LeftIcon, RightIcon]
    );

    return <View style={styles.buttonWrapper}>{data.map(renderButton)}</View>;
  });

  const PinInput = memo(({ val }) => {
    const data = useMemo(() => Array.from({ length: 6 }, (_, i) => i), []);
    const dots = useMemo(
      () =>
        data.map((i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: i < val.length ? colors.secondaryColor : 'transparent',
              },
            ]}
          />
        )),
      [data, val, colors.secondaryColor, styles.dot]
    );
    return <View style={styles.row}>{dots}</View>;
  });

  useEffect(() => {
    if (userVal.length === 6 && onValidatePin) {
      onValidatePin(userVal);
    }
  }, [userVal]);

  return (
    <View style={styles.bodyContainerStyle}>
      <TextInput style={styles.inputContainer} editable={false} />
      <View style={styles.pinInputWrapper}>
        <PinInput val={userVal} />
        <View style={styles.errorWrapper}>
          {showError && (
            <View style={styles.rowCenter}>
              <TriangelDangerIcon size={20} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.contentWrapper}>
        <Buttons
          onPress={(e) => {
            switch (e) {
              case 'X':
                const newStr = userVal.substring(0, userVal.length - 1);
                setUserVal(newStr);
                break;
              case 'biometrics':
                if (onValidateBiometric && isBiometricEnable) {
                  onValidateBiometric();
                }
                break;
              default:
                if (userVal.length < 6) {
                  setUserVal(userVal + e);
                }
            }
          }}
          style={styles}
          LeftIcon={<FaceIcon color={isBiometricEnable ? colors.btnColor : colors.gray80} />}
          RightIcon={<DeleteIcon />}
        />
      </View>
      {isProcessing && <LoadingModal shouldShow={isProcessing} />}
    </View>
  );
});

export default PinNumberComponent;
