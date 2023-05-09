import React, { useCallback, useMemo, useState } from 'react';
import { StepUpService } from '../service/stepup-service';

export interface StepUpContextData {
  authorize: () => Promise<boolean | undefined>;

}

export const StepUpDefaultValue: StepUpContextData = {
  authorize: async () => undefined
};

export const StepUpContext =
  React.createContext<StepUpContextData>(StepUpDefaultValue);

export function useStepUpContextValue(): StepUpContextData {

  const authorize = useCallback(
    async (
    ) => {
      try {
        return true;
      } catch (error) {
      }
    },
    []
  );

  return useMemo(() => ({
    authorize
  }), []);
}
