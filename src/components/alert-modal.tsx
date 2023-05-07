import { fonts } from '@/assets';
import React, { ReactNode } from 'react';
import { Dimensions, Platform, StyleSheet, View, Text } from 'react-native';
import Modal from 'react-native-modal';
import Button from './button';
import themeData from '@/assets/theme-data';

const deviceHeight =
  Platform.OS === 'ios'
    ? Dimensions.get('window').height
    : require('react-native-extra-dimensions-android').get('REAL_WINDOW_HEIGHT');

export type AlertModalProps = {
  title: string;
  message?: string;
  isVisible?: boolean;
  labelColor?: string;
  icon?: ReactNode;
  onBackdropPress?: () => void;
  onConfirmBtnPress: () => void;
  onSubBtnPress?: () => void;
  onClose?: () => void;
  btnLabel: string;
  subBtnLabel?: string;
  isLoading?: boolean;
  isLoadingOnConfirm?: boolean;
};

const AlertModal = (props: AlertModalProps) => {
  const {
    title,
    isVisible,
    message,
    onBackdropPress,
    icon,
    btnLabel,
    subBtnLabel,
    isLoading,
    isLoadingOnConfirm,
    onConfirmBtnPress,
    onSubBtnPress,
  } = props;
  return (
    //https://github.com/facebook/react-native/issues/10471#issuecomment-635553358
    <View style={{ height: 0 }}>
      <Modal
        isVisible={isVisible}
        deviceHeight={deviceHeight}
        onBackdropPress={onBackdropPress}
        backdropTransitionInTiming={50}
        backdropTransitionOutTiming={50}
        hideModalContentWhileAnimating
        useNativeDriverForBackdrop
        useNativeDriver
        statusBarTranslucent
        style={styles.modalStyle}
      >
        <View style={styles.containerStyle}>
          <View style={styles.popupContainer}>
            <>
              {icon}
              <View style={styles.headerStyle}>
                <Text style={styles.title}>{title}</Text>
              </View>
              <View style={styles.content}>
                <Text style={styles.message}>{message}</Text>
              </View>
              {subBtnLabel && (
                <View style={styles.subBtnContainer}>
                  <Button
                    isLoading={isLoading}
                    onPress={onSubBtnPress}
                    label={subBtnLabel}
                    labelColor={themeData.colors.primaryBlackColor}
                    background={themeData.colors.white}
                  />
                </View>
              )}
              {btnLabel && (
                <Button
                  onPress={onConfirmBtnPress}
                  isLoading={isLoadingOnConfirm}
                  label={btnLabel}
                />
              )}
            </>
          </View>
        </View>
      </Modal>
    </View>
  );
};

AlertModal.defaultProps = {
  isVisible: false,
  horizontalSpace: 20,
  backdropOpacity: 0.5,
  animationIn: 'fadeIn',
  animationOut: 'fadeOut',
  isShowClose: true,
  isFullWidth: false,
  isShowLeftIcon: true,
};

const styles = StyleSheet.create({
  modalStyle: {
    flex: 1,
    paddingBottom: 15,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  containerStyle: {
    width: '100%',
  },
  subBtnContainer: {
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    fontFamily: fonts.medium,
    fontSize: 14,
    textAlign: 'center',
    maxWidth: '90%',
    fontWeight: '400',
  },
  popupContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderRadius: 24,
    alignItems: 'center',
  },
  headerStyle: {
    marginTop: 20,
  },
  content: {
    marginTop: 20,
    marginBottom: 35,
  },
  title: {
    color: '#1B1B1B',
    fontSize: 22,
    fontFamily: fonts.medium,
    fontWeight: 'bold',
    textAlign: 'center',
    maxWidth: '95%',
  },
  label: {
    fontSize: 16,
    color: '#FCFCFC',
    textAlign: 'center',
  },
});

export default React.memo(AlertModal);
