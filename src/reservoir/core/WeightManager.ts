import * as tf from '@tensorflow/tfjs';
import { ESNConfig } from '../types/ESNTypes';
import { WeightInitializer } from './WeightInitializer';
import { Logger } from '../../cogutil/Logger';

export class WeightManager {
  private weights: {
    input: tf.Tensor2D;
    reservoir: tf.Tensor2D;
    output: tf.Tensor2D | null;
  };
  private readonly initializer: WeightInitializer;

  constructor(config: ESNConfig) {
    this.initializer = new WeightInitializer(config);
    const { input, reservoir } = this.initializer.initialize();
    this.weights = {
      input,
      reservoir,
      output: null
    };
    Logger.info('WeightManager initialized');
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
    this.weights.output?.dispose();
    this.weights.output = weights.clone();
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