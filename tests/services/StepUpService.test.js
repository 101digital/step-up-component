import axios from "axios";
import { StepUpService } from "../../src/service/stepup-service";
import { StepUpFlow } from "../../src/types";
import { AuthServices } from 'react-native-auth-component';
jest.mock("axios");

jest.mock('react-native-auth-component', () => ({
    AuthServices: jest.fn(),
  }));

describe("StepUp Service", () => {
  it("spy on resumeUrl", async () => {
    let service = StepUpService.instance();
    const mockResponse = "mock resumeUrl response";
    axios.get.mockResolvedValue({
      data: mockResponse,
    });
    let spy = jest.spyOn(service, "resumeUrl");
    const responseData = await service.resumeUrl("url");
    expect(responseData).toEqual(mockResponse);
    spy.mockRestore();
  });
  it("spy on generateNotification", async () => {
    let data = {
      type: "STEPUP",
      referenceId: undefined,
      screen: "",
      contextData: "VirtualDebitCard",
      flowId: StepUpFlow.CARD_ISSUANCE,
    };
    let service = StepUpService.instance();
    service.configure({
      mfaClient: axios,
    });
    let spy = jest.spyOn(service, "generateNotification");
    const responseData = await service.generateNotification(data);
    expect(responseData).toEqual(undefined);
    spy.mockRestore();
  });
  it("spy on obtainTokenSingleFactor", async () => {
    let service = StepUpService.instance();
    const mockResponse = {
        access_token: "mock token",
        id_token: "Token",
    };
    axios.post.mockResolvedValue({
        data: mockResponse,
    });
    // AuthServices.instance().storeOTT.mockReturnValue(mockResponse.access_token);
    // AuthServices.instance().storeIdToken.mockReturnValue(mockResponse.id_token);
    let spy = jest.spyOn(service, "obtainTokenSingleFactor");
    const responseData = await service.obtainTokenSingleFactor("1234");
    expect(responseData).toEqual(undefined);
    spy.mockRestore();
  });
});
