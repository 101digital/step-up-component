import React, { useCallback, useMemo, useState } from 'react';
import { StepUpService } from '../service/stepup-service';
import { NotificationData, StepUpFlow } from '../types';

export interface StepUpContextData {
  authorize: () => Promise<boolean | undefined>;
  isLoadingAuthorize: boolean;
  obtainNewAccessToken: () => Promise<boolean>;
  saveResumeURL: (url: string) => void;
  resumeURL?: string;
  generateNotificationStepUp: (
    flow: StepUpFlow,
    refId?: string,
    contextData?: object
  ) => Promise<boolean | undefined>;
}

export const StepUpDefaultValue: StepUpContextData = {
  authorize: async () => undefined,
  isLoadingAuthorize: false,
  obtainNewAccessToken: async () => false,
  saveResumeURL: () => false,
  generateNotificationStepUp: async () => undefined,
};

const StepUpServiceInstance = StepUpService.instance();

export const StepUpContext =
  React.createContext<StepUpContextData>(StepUpDefaultValue);

export function useStepUpContextValue(): StepUpContextData {
  const [_isLoadingAuthorize, setIsLoadingAuthorize] = useState<boolean>(false);
  const [_resumeURL, saveResumeURL] = useState<string>();

  const authorize = useCallback(async () => {
    try {
      // await StepUpServiceInstance.authorizePushOnly();
      return true;
    } catch (error) {
      return false;
    }
  }, []);

  const generateNotificationStepUp = useCallback(
    async (
      flow: StepUpFlow,
      refId = '18181-98425-11636-67763',
      contextData
    ) => {
      let data: NotificationData = {
        type: 'STEPUP',
        referenceId: refId,
        screen: '',
        contextData: contextData,
        flowId: flow,
      };
      
      try {
        await StepUpServiceInstance.generateNotification(data);
        return true;
      } catch (error) {
        return false;
      }
    },
    []
  );

  const obtainNewAccessToken = useCallback(async () => {
    try {
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

  return useMemo(
    () => ({
      authorize,
      isLoadingAuthorize: _isLoadingAuthorize,
      obtainNewAccessToken,
      saveResumeURL,
      resumeURL: _resumeURL,
      generateNotificationStepUp,
    }),
    [_isLoadingAuthorize, _resumeURL]
  );
}
