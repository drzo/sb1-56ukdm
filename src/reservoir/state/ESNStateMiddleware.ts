import { ESNState, ESNConfig } from '../types/ESNTypes';
import { ESNStateValidator } from './ESNStateValidator';
import { Logger } from '../../cogutil/Logger';

type StateHandler = (state: ESNState) => Promise<ESNState>;

export class ESNStateMiddleware {
  private preUpdateHandlers: StateHandler[] = [];
  private postUpdateHandlers: StateHandler[] = [];
  private config: ESNConfig;

  constructor(config: ESNConfig) {
    this.config = config;
    this.addDefaultHandlers();
  }

  private addDefaultHandlers(): void {
    // Add validation handler
    this.addPreUpdateHandler(async (state) => {
      const validator = new ESNStateValidator(this.config);
      validator.validateState(state);
      return state;
    });

    // Add logging handler
    this.addPostUpdateHandler(async (state) => {
      Logger.debug('State updated:', {
        timestamp: state.timestamp,
        stateNorm: Math.sqrt(state.state.reduce((sum, v) => sum + v * v, 0))
      });
      return state;
    });
  }

  addPreUpdateHandler(handler: StateHandler): void {
    this.preUpdateHandlers.push(handler);
  }

  addPostUpdateHandler(handler: StateHandler): void {
    this.postUpdateHandlers.push(handler);
  }

  async processState(state: ESNState): Promise<ESNState> {
    let processedState = { ...state };

    // Run pre-update handlers
    for (const handler of this.preUpdateHandlers) {
      processedState = await handler(processedState);
    }

    // Run post-update handlers
    for (const handler of this.postUpdateHandlers) {
      processedState = await handler(processedState);
    }

    return processedState;
  }
}