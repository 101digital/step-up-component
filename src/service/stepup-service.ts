type StepUpClient = {};

export class StepUpService {
  private static _instance: StepUpService = new StepUpService();

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

  public initClients = (clients: StepUpClient) => {};
}
