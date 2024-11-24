import { ESNConfig, TrainingData } from '../types/ESNTypes';
import { Logger } from '../../cogutil/Logger';

export class ESNValidator {
  static validateConfig(config: ESNConfig): void {
    const errors: string[] = [];

    // Basic parameter validation
    if (config.inputSize <= 0) errors.push('Input size must be greater than 0');
    if (config.reservoirSize <= 0) errors.push('Reservoir size must be greater than 0');
    if (config.spectralRadius <= 0 || config.spectralRadius > 1) errors.push('Spectral radius must be between 0 and 1');
    if (config.inputScaling <= 0) errors.push('Input scaling must be greater than 0');
    if (config.leakingRate <= 0 || config.leakingRate > 1) errors.push('Leaking rate must be between 0 and 1');
    if (config.sparsity < 0 || config.sparsity > 1) errors.push('Sparsity must be between 0 and 1');

    // Advanced parameter validation
    if (config.ridgeParam !== undefined && config.ridgeParam < 0) {
      errors.push('Ridge parameter must be non-negative');
    }

    if (config.activationFunction && 
        !['tanh', 'sigmoid', 'relu'].includes(config.activationFunction)) {
      errors.push('Invalid activation function');
    }

    if (config.feedbackScaling !== undefined && config.feedbackScaling < 0) {
      errors.push('Feedback scaling must be non-negative');
    }

    if (config.washoutLength !== undefined && config.washoutLength < 0) {
      errors.push('Washout length must be non-negative');
    }

    if (config.readoutRegularization !== undefined && config.readoutRegularization < 0) {
      errors.push('Readout regularization must be non-negative');
    }

    if (errors.length > 0) {
      Logger.error('Invalid ESN configuration:', errors);
      throw new Error(`Invalid ESN configuration: ${errors.join(', ')}`);
    }
  }

  static validateInput(input: Float32Array, expectedSize: number): void {
    if (input.length !== expectedSize) {
      const error = `Invalid input size: expected ${expectedSize}, got ${input.length}`;
      Logger.error(error);
      throw new Error(error);
    }
  }

  static validateTrainingData(data: TrainingData, config: ESNConfig): void {
    const errors: string[] = [];

    if (!data.inputs?.length || !data.targets?.length) {
      errors.push('Training data must not be empty');
    }

    if (data.inputs?.length !== data.targets?.length) {
      errors.push('Input and target sequences must have the same length');
    }

    data.inputs?.forEach((input, i) => {
      if (input.length !== config.inputSize) {
        errors.push(`Invalid input size at index ${i}: expected ${config.inputSize}, got ${input.length}`);
      }
    });

    if (errors.length > 0) {
      Logger.error('Invalid training data:', errors);
      throw new Error(`Invalid training data: ${errors.join(', ')}`);
    }
  }
}