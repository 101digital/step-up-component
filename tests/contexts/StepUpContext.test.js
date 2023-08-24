import { act } from "react-test-renderer";
import {
 useStepUpContextValue,
} from "../../src/context/stepup-context";
import { renderHook } from "@testing-library/react-native";

jest.mock('../../src/context/stepup-context', () => ({
  useStepUpContextValue: () => ({
    authorize: jest.fn(),
  isLoadingAuthorize: false,
  obtainNewAccessToken: jest.fn(),
  saveResumeURL: jest.fn(() => false),
  generateNotificationStepUp: jest.fn(),
  })
}));


describe('useStepUpContextValue', () => {
  it('should return default context values', () => {
      const { result } = renderHook(() => useStepUpContextValue());   
      expect(result.current.isLoadingAuthorize).toBe(false);
      expect(result.current.resumeURL).toBeUndefined();
      expect(typeof result.current.authorize).toBe('function');
      expect(typeof result.current.obtainNewAccessToken).toBe('function');
      expect(typeof result.current.generateNotificationStepUp).toBe('function');
      expect(typeof result.current.saveResumeURL).toBe('function');

  });

  it('should call generateNotificationStepUp', async () => {
    const { result } = renderHook(() => useStepUpContextValue());

    const flow = 'some-flow';
    const refId = 'some-ref-id';
    const contextData = { key: 'value' };

    await act(async () => {
      const success = await result.current.generateNotificationStepUp(
        flow,
        refId,
        contextData
      );

      expect(success).toBe(undefined);
      expect(result.current.isLoadingAuthorize).toBe(false);
    });
  });
});