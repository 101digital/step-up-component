import CryptoStore from './crypto';
import SInfo from 'react-native-sensitive-info';
import base64 from 'react-native-base64';
import { StepUpService } from './stepup-service';
import { generateSecureRandom } from 'react-native-securerandom';
import AsyncStorage from '@react-native-async-storage/async-storage';

const IS_ENABLE_BIOMETRIC = 'authcomponent.enableBio';
const PIN_TOKEN = 'authcomponent.pinToken';
const BIO_TOKEN = 'authcomponent.biometricToken.currentSet';

const keySize = 256;
const cost = 10000;
const saltLength = 12;

const sensitiveInfoOptions = {
  sharedPreferencesName: 'mySharedPrefs',
  keychainService: 'myKeychain',
};

const biometricChangeErrorCode = {
  error: {
    code: 'BIOMETRIC_CHANGE',
  },
};

class StepUpUtils {
  getIsEnableBiometric = () => AsyncStorage.getItem(IS_ENABLE_BIOMETRIC);

  getSalt = async () => {
    const salt = await SInfo.getItem('key', sensitiveInfoOptions);
    if (!!salt && salt.length > 0) {
      return base64.decode(salt);
    } else {
      const random = await generateSecureRandom(saltLength);
      const encoded = base64.encodeFromByteArray(random);
      SInfo.setItem('key', encoded, sensitiveInfoOptions);

      return base64.decode(encoded);
    }
  };

  validatePin = async (pinNumber: string) => {
    try {
      const dataEncrypted = await SInfo.getItem(
        PIN_TOKEN,
        sensitiveInfoOptions
      );
      const salt = await this.getSalt();
      const key = await CryptoStore.generateKey(pinNumber, salt, cost, keySize); //cost = 10000
      const loginHintToken = await CryptoStore.decryptData(
        JSON.parse(dataEncrypted),
        key
      );

      return await StepUpService.instance().authorizePushOnly(loginHintToken);
    } catch (error) {
      return error?.response?.data;
    }
  };

  validateBiometric = async () => {
    try {
      const loginHintToken = await SInfo.getItem(BIO_TOKEN, {
        ...sensitiveInfoOptions,
        touchID: true,
        showModal: true,
        strings: {
          description: 'Do you want to allow {ADB} to use Finger Print ID?',
          header:
            '{ADB} uses Finger Print ID to restrict unauthorized users from accessing the app.',
        },
        kSecUseOperationPrompt:
          'We need your permission to retrieve encrypted data',
      });
      if (!loginHintToken) {
        return biometricChangeErrorCode;
      }
      return await StepUpService.instance().authorizePushOnly(loginHintToken);
    } catch (error) {
      if (error.message === 'Key permanently invalidated') {
        return biometricChangeErrorCode;
      }
      return error?.response?.data;
    }
  };
}

const instance = new StepUpUtils();
export default instance;
