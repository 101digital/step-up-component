import { defaultsDeep } from 'lodash';
import { useContext } from 'react';
import { StyleProp, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { ThemeContext } from 'react-native-theme-component';

export type AppPasscodeCompStyle = {
  buttonWrapper: StyleProp<ViewStyle>;
  buttonTextContainer: StyleProp<TextStyle>;
  errorText: StyleProp<TextStyle>;
  buttonContainer: StyleProp<ViewStyle>;
  row: StyleProp<ViewStyle>;
  dot: StyleProp<ViewStyle>;
  bodyContainerStyle: StyleProp<ViewStyle>;
  extraDataRow: StyleProp<ViewStyle>;
  pinInputWrapper: StyleProp<ViewStyle>;
  contentWrapper: StyleProp<ViewStyle>;
  inputContainer: StyleProp<ViewStyle>;
  errorWrapper: StyleProp<ViewStyle>;
  rowCenter: StyleProp<ViewStyle>;
};

const useMergeStyles = (style?: AppPasscodeCompStyle) => {
  const { colors } = useContext(ThemeContext);

  const defaultStyles: AppPasscodeCompStyle = StyleSheet.create({
    buttonWrapper: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'center',
    },
    buttonTextContainer: { fontWeight: '600', color: colors.secondaryColor },
    buttonContainer: {
      height: 64,
      width: 64,
      marginHorizontal: 16,
      marginVertical: 8,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 100,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      // paddingHorizontal: 60,
    },
    pinInputWrapper: {
      justifyContent: 'center',
      alignItems: 'center',
      // paddingTop:20,
      paddingTop: '7.5%',
    },
    dot: {
      height: 16,
      width: 16,
      borderRadius: 20,
      marginHorizontal: 12,
      borderWidth: 1,
    },
    extraDataRow: {
      marginVertical: 4,
      paddingHorizontal: 24,
      flexDirection: 'row',
      alignItems: 'center',
    },
    inputContainer: {
      borderWidth: 1,
      position: 'absolute',
      width: '100%',
      opacity: 0,
      marginTop: 50,
    },
    bodyContainerStyle: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    contentWrapper: {
      flex: 1,
      alignItems: 'flex-end',
      justifyContent: 'flex-end',
      maxWidth: 300,
      // backgroundColor:'red'
    },
    errorWrapper: {
      alignItems: 'center',
      paddingTop: 10,
      minHeight: 25,
    },
    errorText: {
      color: colors.errorTextColor,
      marginLeft: 7,
    },
    rowCenter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      // marginTop: 30,
    },
  });

  return defaultsDeep(style, defaultStyles);
};

export default useMergeStyles;
