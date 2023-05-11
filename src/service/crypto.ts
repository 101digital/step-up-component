import Aes from 'react-native-aes-crypto';
import { sha256 } from 'react-native-sha256';

const ALGORITHM = 'aes-256-cbc';
const KEY_LENGTH = 16;

type EncryptedData = {
  cipher: string;
  iv: string;
};

type CryptoMethod = 'SHA256' | 'AES';

class CryptoStore {
  generateKey = (password: string, salt: string, cost: number, length: number) =>
    Aes.pbkdf2(password, salt, cost, length);

  encryptData = async (text: string, key: string, method?: CryptoMethod): Promise<EncryptedData | string> => {
    if(method === 'AES') {
      return Aes.randomKey(KEY_LENGTH).then(async (iv) => {
        const cipher = await Aes.encrypt(text, key, iv, ALGORITHM);
  
        return {
          cipher,
          iv,
        };
      });
    } else {
      return sha256(text).then((value) => {
        return value;
      })
    }
  };

  decryptData = (encryptedData: EncryptedData, key: string) =>
    Aes.decrypt(encryptedData.cipher, key, encryptedData.iv, ALGORITHM);
}

const instance = new CryptoStore();
export default instance;
