import { ESNConfig } from '../types/ESNTypes';
import { Logger } from '../../cogutil/Logger';

export class StateValidator {
  static validateState(manager: any): void {
    if (manager.disposed) {
      throw new Error('ESN state manager has been disposed');
    }

    if (!manager.weights || !manager.state) {
      throw new Error('ESN state is not properly initialized');
    }
  }

  static validateWeights(weights: tf.Tensor2D, config: ESNConfig): void {
    const shape = weights.shape;
    
    if (shape[0] !== config.reservoirSize) {
      throw new Error(
        `Invalid output weights shape: expected first dimension ${config.reservoirSize}, got ${shape[0]}`
      );
    }

    Logger.debug('Weight validation passed');
  }
}