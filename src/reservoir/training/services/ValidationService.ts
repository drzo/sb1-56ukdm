import { TrainingData, ESNMetrics } from '../../types/ESNTypes';
import { StateManager } from '../../state/StateManager';
import { WeightManager } from '../../weights/WeightManager';
import { Logger } from '../../../cogutil/Logger';

export class ValidationService {
  private static instance: ValidationService;

  private constructor() {}

  public static getInstance(): ValidationService {
    if (!ValidationService.instance) {
      ValidationService.instance = new ValidationService();
    }
    return ValidationService.instance;
  }

  async validateData(data: TrainingData): Promise<void> {
    try {
      if (!data.inputs?.length || !data.targets?.length) {
        throw new Error('Training data must not be empty');
      }

      if (data.inputs.length !== data.targets.length) {
        throw new Error('Input and target sequences must have same length');
      }

      const inputSize = data.inputs[0].length;
      const targetSize = data.targets[0].length;

      data.inputs.forEach((input, i) => {
        if (input.length !== inputSize) {
          throw new Error(`Invalid input size at index ${i}`);
        }
      });

      data.targets.forEach((target, i) => {
        if (target.length !== targetSize) {
          throw new Error(`Invalid target size at index ${i}`);
        }
      });

      Logger.debug('Training data validation passed');
    } catch (error) {
      Logger.error('Training data validation failed:', error);
      throw error;
    }
  }

  async validateMetrics(metrics: ESNMetrics): Promise<void> {
    try {
      if (typeof metrics.accuracy !== 'number' || 
          metrics.accuracy < 0 || 
          metrics.accuracy > 1) {
        throw new Error('Invalid accuracy value');
      }

      if (typeof metrics.stability !== 'number' || 
          metrics.stability < 0 || 
          metrics.stability > 1) {
        throw new Error('Invalid stability value');
      }

      if (typeof metrics.complexity !== 'number' || 
          metrics.complexity < 0) {
        throw new Error('Invalid complexity value');
      }

      Logger.debug('Metrics validation passed');
    } catch (error) {
      Logger.error('Metrics validation failed:', error);
      throw error;
    }
  }

  async validateState(
    stateManager: StateManager,
    weightManager: WeightManager
  ): Promise<void> {
    try {
      const state = stateManager.getCurrentState();
      const weights = weightManager.getWeights();

      if (!state || state.length === 0) {
        throw new Error('Invalid state');
      }

      if (!weights.inputWeights || !weights.reservoirWeights) {
        throw new Error('Invalid weights');
      }

      Logger.debug('State validation passed');
    } catch (error) {
      Logger.error('State validation failed:', error);
      throw error;
    }
  }
}