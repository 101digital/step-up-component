import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import qs from 'qs';
import pkceChallenge from 'react-native-pkce-challenge';
import { AuthServices } from 'react-native-auth-component';
import CryptoStore from './crypto';
import { NotificationData } from '../types';

export type StepUpComponentConfig = {
  nonce: string;
  clientId: string;
  scope: string;
  responseType: string;
  responseMode: string;
  acrValues: string;
  identityPingUrl: string;
  authBaseUrl: string;
  authGrantType: string;
  encryptedJWT?: string;
  mfaClient: AxiosInstance;
};

type PKCE = {
  codeChallenge: string;
  codeVerifier: string;
};

export class StepUpService {
  private static _instance: StepUpService = new StepUpService();
  private _configs?: StepUpComponentConfig;
  private _pkce: PKCE = pkceChallenge();

  public configure(configs: StepUpComponentConfig) {
    this._configs = configs;
  }

  private refreshPKCEChallenge() {
    this._pkce = pkceChallenge();
    return this._pkce;
  }

  public async setToken(token: string) {
    AuthServices.instance().storeJWTPushNotification(token);
    return CryptoStore.encryptData(token, '', 'SHA256').then(
      (encryptedToken) => {
        if (typeof encryptedToken === 'string' && this._configs) {
          this._configs.encryptedJWT = encryptedToken;
        }
      }
    );
  }

  constructor() {
    if (StepUpService._instance) {
      throw new Error(
        'Error: Instantiation failed: Use StepUpService.getInstance() instead of new.'
      );
    }
    StepUpService._instance = this;
  }

  public static instance(): StepUpService {
    return StepUpService._instance;
  }

  public resumeUrl = async (url: string) => {
    const response = await axios.get(url);
    return response.data;
  };

  public obtainTokenSingleFactor = async (authorizeCode: string) => {
    const { clientId, authBaseUrl, authGrantType, scope } = this._configs || {};
    const { codeVerifier } = this._pkce;
    const body = qs.stringify({
      grant_type: authGrantType,
      code: authorizeCode,
      scope: scope,
      code_verifier: codeVerifier,
      client_id: clientId,
    });

    const response = await axios.post(`${authBaseUrl}/as/token`, body);
    const access_token = response.data.access_token;
    const id_token = response.data.id_token;
    AuthServices.instance().storeAccessToken(access_token);
    AuthServices.instance().storeIdToken(id_token);
  };

  public authorizePushOnly = async (loginHintToken: string) => {
    const { clientId, responseType, responseMode, authBaseUrl, scope } =
      this._configs || {};
    try {
      const { codeChallenge } = this.refreshPKCEChallenge();
      const responseAuth = await axios.get(`${authBaseUrl}/as/authorize`, {
        params: {
          response_type: responseType,
          client_id: clientId,
          scope: scope,
          code_challenge: codeChallenge,
          code_challenge_method: 'S256',
          response_mode: responseMode,
          acr_values: 'Push_Only',
          login_hint_token: loginHintToken,
          nonce: this._configs?.encryptedJWT,
        },
      });
      if (responseAuth) {
        return responseAuth.data;
      }
    } catch (error) {
      return false;
    }
  };

  public generateNotification = async (data: NotificationData) => {
    console.log('generateNotification -> data', data);
    const { mfaClient } = this._configs || {};
    if (mfaClient) {
      console.log('generateNotification2');
      await mfaClient.post('notifications', data);
    } else {
      throw 'mfa client not available';
    }
  };
}
