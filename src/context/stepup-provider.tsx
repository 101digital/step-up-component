import React, { ReactNode } from "react";
import { useStepUpContextValue, StepUpContext } from "./stepup-context";

export type StepUpProviderProps = {
  children: ReactNode;
};

const StepUpProvider = (props: StepUpProviderProps) => {
  const { children } = props;
  const onboardingContextData = useStepUpContextValue();

  return (
    <StepUpContext.Provider value={onboardingContextData}>
      {children}
    </StepUpContext.Provider>
  );
};

export default StepUpProvider;
