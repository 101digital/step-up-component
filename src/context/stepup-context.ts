import React, { useCallback, useMemo, useState } from 'react';
import { StepUpService } from '../service/stepup-service';

export interface StepUpContextData {
  authorize: () => Promise<boolean | undefined>;
  isLoadingAuthorize: boolean;
  obtainNewAccessToken: () => Promise<boolean>;
  saveResumeURL: (url: string) => void;
  resumeURL?: string;
}

export const StepUpDefaultValue: StepUpContextData = {
  authorize: async () => undefined,
  isLoadingAuthorize: false,
  obtainNewAccessToken: async () => false,
  saveResumeURL: () => false
};


const StepUpServiceInstance = StepUpService.instance();

export const StepUpContext =
  React.createContext<StepUpContextData>(StepUpDefaultValue);

export function useStepUpContextValue(): StepUpContextData {
  const [_isLoadingAuthorize, setIsLoadingAuthorize] = useState<boolean>(false);
  const [_resumeURL, saveResumeURL] = useState<string>();

  const authorize = useCallback(
    async (
    ) => {
      try {
        // await StepUpServiceInstance.authorizePushOnly();
        return true;
      } catch (error) {
        return false;
      }
    },
    []
  );


  const obtainNewAccessToken = useCallback(async () => {
    try {
      console.log('obtainNewAccessToken -> _resumeURL', _resumeURL);
      if (_resumeURL) {
        const authResponse = await StepUpServiceInstance.resumeUrl(_resumeURL);

        if (authResponse && authResponse.authorizeResponse?.code) {
          await StepUpServiceInstance.obtainTokenSingleFactor(
            authResponse.authorizeResponse.code
          );
        }
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }, [_resumeURL]);

  return useMemo(() => ({
    authorize,
    isLoadingAuthorize: _isLoadingAuthorize,
    obtainNewAccessToken,
    saveResumeURL,
    resumeURL: _resumeURL
  }), [_isLoadingAuthorize, _resumeURL]);
}
