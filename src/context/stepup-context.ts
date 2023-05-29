import React, { useCallback, useMemo, useState } from 'react';
import { StepUpService } from '../service/stepup-service';
import { NotificationData, StepUpFlow } from '../types';

export interface StepUpContextData {
  authorize: () => Promise<boolean | undefined>;
  isLoadingAuthorize: boolean;
  obtainNewAccessToken: () => Promise<boolean>;
  saveResumeURL: (url: string) => void;
  resumeURL?: string;
  generateNotificationStepUp: (flow: StepUpFlow, refId?: string, contextData?: object) => Promise<boolean | undefined>;
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

  const generateNotificationStepUp = useCallback(
    async (
      flow: StepUpFlow,
      refId = '18181-98425-11636-67763',
      contextData
    ) => {
      console.log('generateNotificationStepUp -> context', flow);
      let data: NotificationData = {
        type: "STEPUP",
        referenceId: refId,
        screen: "",
        contextData: contextData
      };

      switch(flow) {
        case StepUpFlow.CARD_ISSUANCE:
          data = {
            ...data,
            flowId: StepUpFlow.CARD_ISSUANCE,
          }
          break;
        case StepUpFlow.CARD_PCI_DATA:
          data = {
            ...data,
            flowId: StepUpFlow.CARD_PCI_DATA,
          }
          break;
        case StepUpFlow.CARD_PIN:
          data = {
            ...data,
            flowId: StepUpFlow.CARD_PIN,
          }
          break;
        case StepUpFlow.CARD_LOCK:
          data = {
            ...data,
            flowId: StepUpFlow.CARD_LOCK,
          }
          break;
        case StepUpFlow.CARD_UNLOCK:
          data = {
            ...data,
            flowId: StepUpFlow.CARD_UNLOCK,
          }
          break;
        case StepUpFlow.CARD_LIMIT:
          data = {
            ...data,
            flowId: StepUpFlow.CARD_LIMIT,
          }
          break;
        case StepUpFlow.S3D_AUTH:
          data = {
            ...data,
            flowId: StepUpFlow.S3D_AUTH,
          }
          break;
        case StepUpFlow.NAD_MAINTENACE:
          data = {
            ...data,
            flowId: StepUpFlow.NAD_MAINTENACE,
          }
          break;
        case StepUpFlow.NAD_REGISTER:
          data = {
            ...data,
            flowId: StepUpFlow.NAD_REGISTER,
          }
          break;
        case StepUpFlow.QR_PAYMENT:
          data = {
            ...data,
            flowId: StepUpFlow.QR_PAYMENT,
          }
          break;
      }

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
    resumeURL: _resumeURL,
    generateNotificationStepUp
  }), [_isLoadingAuthorize, _resumeURL]);
}
