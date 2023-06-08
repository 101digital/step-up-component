import React, { useContext } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { ThemeContext } from 'react-native-theme-component';

interface IButton {
  background?: string;
  label: string;
  onPress?: () => void;
  labelColor?: string;
}
const Button: React.FC<IButton> = (props: IButton) => {
  const { colors } = useContext(ThemeContext);
  return (
    <TouchableOpacity
      onPress={props.onPress}
      style={[
        styles.container,
        {
          backgroundColor: props.background ?? colors.secondaryColor,
          borderColor: colors.secondaryColor,
        },
      ]}
    >
      <Text style={[styles.label, { color: props.labelColor ?? colors.white }]}>{props.label}</Text>
    </TouchableOpacity>
  );
};

export default Button;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 100,
    padding: 16,
    borderWidth: 3,
  },
  label: {
    // ...palette.subtitle,
    fontSize: 14,
    textAlign: 'center',
  },
});
