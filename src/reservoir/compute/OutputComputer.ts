import * as tf from '@tensorflow/tfjs';
import { Logger } from '../../cogutil/Logger';

export class OutputComputer {
  private outputWeights: tf.Tensor2D | null = null;
  private outputActivation: 'linear' | 'sigmoid' | 'tanh';

  constructor(outputActivation: 'linear' | 'sigmoid' | 'tanh' = 'linear') {
    this.outputActivation = outputActivation;
  }

  async computeOutput(state: tf.Tensor2D): Promise<tf.Tensor2D> {
    try {
      if (!this.outputWeights) {
        throw new Error('Output weights not initialized');
      }

      return tf.tidy(() => {
        const output = tf.matMul(state, this.outputWeights);
        return this.applyOutputActivation(output);
      });
    } catch (error) {
      Logger.error('Failed to compute output:', error);
      throw error;
    }
  }

  setOutputWeights(weights: tf.Tensor2D): void {
    this.outputWeights?.dispose();
    this.outputWeights = weights.clone();
  }

  private applyOutputActivation(tensor: tf.Tensor2D): tf.Tensor2D {
    switch (this.outputActivation) {
      case 'sigmoid':
        return tf.sigmoid(tensor);
      case 'tanh':
        return tf.tanh(tensor);
      case 'linear':
      default:
        return tensor;
    }
  }

  setOutputActivation(activation: 'linear' | 'sigmoid' | 'tanh'): void {
    this.outputActivation = activation;
  }

  dispose(): void {
    this.outputWeights?.dispose();
    this.outputWeights = null;
  }
}