import React, { useCallback, useMemo, useState } from 'react';
import { StepUpService } from '../service/stepup-service';

export interface StepUpContextData {}

export const StepUpDefaultValue: StepUpContextData = {};

export const StepUpContext =
  React.createContext<StepUpContextData>(StepUpDefaultValue);

export function useStepUpContextValue(): StepUpContextData {
  return useMemo(() => ({}), []);
}
