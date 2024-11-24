import * as tf from '@tensorflow/tfjs';
import { ESNConfig } from '../types/ESNTypes';
import { WeightInitializer } from './WeightInitializer';
import { WeightValidator } from './WeightValidator';
import { Logger } from '../../cogutil/Logger';

export class WeightManager {
  private weights: {
    input: tf.Tensor2D;
    reservoir: tf.Tensor2D;
    output: tf.Tensor2D | null;
  };
  private readonly initializer: WeightInitializer;
  private readonly validator: WeightValidator;

  constructor(config: ESNConfig) {
    this.initializer = new WeightInitializer(config);
    this.validator = new WeightValidator(config);
    this.weights = {
      input: tf.zeros([config.reservoirSize, config.inputSize]),
      reservoir: tf.zeros([config.reservoirSize, config.reservoirSize]),
      output: null
    };
  }

  async initialize(): Promise<void> {
    try {
      const { input, reservoir } = await this.initializer.initialize();
      this.weights.input = input;
      this.weights.reservoir = reservoir;
      Logger.info('Weight manager initialized');
    } catch (error) {
      Logger.error('Failed to initialize weights:', error);
      throw error;
    }
  }

  getWeights(): {
    inputWeights: tf.Tensor2D;
    reservoirWeights: tf.Tensor2D;
  } {
    return {
      inputWeights: this.weights.input,
      reservoirWeights: this.weights.reservoir
    };
  }

  getOutputWeights(): tf.Tensor2D | null {
    return this.weights.output;
  }

  setOutputWeights(weights: tf.Tensor2D): void {
    try {
      this.validator.validateOutputWeights(weights);
      this.weights.output?.dispose();
      this.weights.output = weights.clone();
    } catch (error) {
      Logger.error('Failed to set output weights:', error);
      throw error;
    }
  }

  getWeightsAsArrays(): {
    input: number[][];
    reservoir: number[][];
    output: number[][];
  } {
    return {
      input: this.weights.input.arraySync(),
      reservoir: this.weights.reservoir.arraySync(),
      output: this.weights.output?.arraySync() || []
    };
  }

  dispose(): void {
    try {
      Object.values(this.weights).forEach(tensor => tensor?.dispose());
      Logger.info('Weights disposed');
    } catch (error) {
      Logger.error('Failed to dispose weights:', error);
      throw error;
    }
  }
}