import { ESNConfig } from '../types/ESNTypes';
import { Logger } from '../../cogutil/Logger';
import * as tf from '@tensorflow/tfjs';

export class WeightValidator {
  private config: ESNConfig;

  constructor(config: ESNConfig) {
    this.config = config;
  }

  validateInputWeights(weights: tf.Tensor2D): void {
    const shape = weights.shape;
    
    if (shape[0] !== this.config.reservoirSize || 
        shape[1] !== this.config.inputSize) {
      throw new Error(
        `Invalid input weights shape: expected ${this.config.reservoirSize}x${this.config.inputSize}, ` +
        `got ${shape[0]}x${shape[1]}`
      );
    }
  }

  validateReservoirWeights(weights: tf.Tensor2D): void {
    const shape = weights.shape;
    
    if (shape[0] !== this.config.reservoirSize || 
        shape[1] !== this.config.reservoirSize) {
      throw new Error(
        `Invalid reservoir weights shape: expected ${this.config.reservoirSize}x${this.config.reservoirSize}, ` +
        `got ${shape[0]}x${shape[1]}`
      );
    }

    // Check spectral radius
    tf.tidy(() => {
      const maxEigenvalue = this.approximateMaxEigenvalue(weights);
      if (maxEigenvalue.greater(this.config.spectralRadius).dataSync()[0]) {
        throw new Error('Spectral radius constraint violated');
      }
    });
  }

  validateOutputWeights(weights: tf.Tensor2D): void {
    const shape = weights.shape;
    
    if (shape[0] !== this.config.reservoirSize) {
      throw new Error(
        `Invalid output weights shape: expected first dimension ${this.config.reservoirSize}, ` +
        `got ${shape[0]}`
      );
    }
  }

  private approximateMaxEigenvalue(matrix: tf.Tensor2D): tf.Scalar {
    return tf.tidy(() => {
      let vector = tf.randomNormal([matrix.shape[0], 1]);
      const numIterations = 50;

      for (let i = 0; i < numIterations; i++) {
        const norm = tf.norm(vector);
        vector = vector.div(norm);
        vector = tf.matMul(matrix, vector);
      }

      const numerator = tf.sum(tf.mul(tf.matMul(matrix, vector), vector));
      const denominator = tf.sum(tf.mul(vector, vector));
      
      return tf.abs(numerator.div(denominator));
    });
  }
}