
import { AxiosInstance } from 'axios';

export type StepUpComponentConfig = {
  authorizeClient: AxiosInstance;
};

export class StepUpService {
  private static _instance: StepUpService = new StepUpService();
  private _config?: StepUpComponentConfig;

  public configure(configs: StepUpComponentConfig) {
    this._config = configs;
  }

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
}
