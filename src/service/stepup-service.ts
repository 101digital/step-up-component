
import { AxiosInstance } from 'axios';
import pkceChallenge from 'react-native-pkce-challenge';

export type StepUpComponentConfig = {
  authorizeClient: AxiosInstance;
  nonce: string;
  clientId: string;
  scope: string;
  responseType: string;
  responseMode: string;
  acr_values: string;
};

type PKCE = {
  codeChallenge: string;
  codeVerifier: string;
};

export class StepUpService {
  private static _instance: StepUpService = new StepUpService();
  private _configs?: StepUpComponentConfig;
  private _pkce: PKCE = pkceChallenge();
  private _accessToken: string = '';


  public configure(configs: StepUpComponentConfig) {
    this._configs = configs;
  }

  public setAccessToken(acessToken: string) {
    this._accessToken = acessToken;
  }

  private refreshPKCEChallenge() {
    this._pkce = pkceChallenge();
    return this._pkce;
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


  public authorizePushOnly = async (
    loginHintToken: string,
    clientIdInit?: string,
    scope?: string
  ) => {
    const { clientId, responseType, responseMode } = this._configs || {};
    try {
      const { codeChallenge } = this.refreshPKCEChallenge();
      // const responseAuth = await AuthApiClient.instance()
      //   .getAuthApiClient()
      //   .get('as/authorize', {
      //     params: {
      //       response_type: responseType,
      //       client_id: clientIdInit ? clientIdInit : clientId,
      //       scope: scope ? scope : 'openid profilep',
      //       code_challenge: codeChallenge,
      //       code_challenge_method: 'S256',
      //       response_mode: responseMode,
      //       acr_values: 'Push_Only',
      //       login_hint_token: loginHintToken,
      //     },
      //   });
      // if (responseAuth) {
      //   return responseAuth.data;
      // }
    } catch (error) {
      return false;
    }
  };
}
