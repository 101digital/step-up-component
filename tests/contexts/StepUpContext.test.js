import React, { useEffect } from "react";
import {
  StepUpContext,
} from "../../src/context/stepup-context";
import { cleanup, render, waitFor } from "@testing-library/react-native";
import { StepUpFlow } from "../../src/types";

const StepUpDefaultValue = {
  authorize: jest.fn(),
  isLoadingAuthorize: false,
  obtainNewAccessToken: jest.fn(() => false),
  saveResumeURL: () => false,
  generateNotificationStepUp: jest.fn(),
}
describe("step-up-component", () => {
  let contextConsumer = null;

  beforeEach(() => {
    // Set up the context value for testing
    contextValue = StepUpDefaultValue;
  });

  afterEach(cleanup);

  it("should initialize context with correct values", () => {

    const ConsumerComponent = () => {
      contextConsumer = React.useContext(StepUpContext);
      expect(contextConsumer.isLoadingAuthorize).toBeFalsy();
      expect(contextConsumer.authorize).toBeDefined();
      expect(contextConsumer.generateNotificationStepUp).toBeDefined();
      expect(contextConsumer.saveResumeURL).toBeDefined()
      expect(contextConsumer.resumeURL).toBe(undefined)
      return null;
    };

    render(
      <StepUpContext.Provider value={contextValue}>
        <ConsumerComponent />
      </StepUpContext.Provider>
    );
  });

  it('Should call generateNotificationStepUp method', () => {
    const ConsumerComponent = () => {
      contextConsumer = React.useContext(StepUpContext);
      useEffect(() => {
        contextConsumer.generateNotificationStepUp(StepUpFlow.CARD_ISSUANCE, 'VirtualDebitCard')
      }, [contextConsumer])
      return null;
    };

    render(
      <StepUpContext.Provider value={contextValue}>
        <ConsumerComponent />
      </StepUpContext.Provider>
    );

     waitFor(() => {
      expect(contextConsumer.generateNotificationStepUp).toHaveBeenCalledWith(StepUpFlow.CARD_ISSUANCE, 'VirtualDebitCard')
    })
  })
});
