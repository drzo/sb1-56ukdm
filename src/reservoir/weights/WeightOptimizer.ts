import { ESNConfig } from '../types/ESNTypes';
import { Logger } from '../../cogutil/Logger';
import * as tf from '@tensorflow/tfjs';

export class WeightOptimizer {
  private config: ESNConfig;

  constructor(config: ESNConfig) {
    this.config = config;
  }

  async optimize(weights: {
    input: tf.Tensor2D;
    reservoir: tf.Tensor2D;
    output: tf.Tensor2D | null;
  }): Promise<{
    input: tf.Tensor2D;
    reservoir: tf.Tensor2D;
    output: tf.Tensor2D | null;
  }> {
    try {
      const optimizedInput = await this.optimizeInputWeights(weights.input);
      const optimizedReservoir = await this.optimizeReservoirWeights(weights.reservoir);
      
      return {
        input: optimizedInput,
        reservoir: optimizedReservoir,
        output: weights.output
      };
    } catch (error) {
      Logger.error('Weight optimization failed:', error);
      throw error;
    }
  }

  private async optimizeInputWeights(weights: tf.Tensor2D): Promise<tf.Tensor2D> {
    return tf.tidy(() => {
      // Scale input weights
      return weights.mul(this.config.inputScaling);
    });
  }

  private async optimizeReservoirWeights(weights: tf.Tensor2D): Promise<tf.Tensor2D> {
    return tf.tidy(() => {
      // Apply sparsity
      const sparseMask = tf.randomUniform(weights.shape)
        .greater(1 - this.config.sparsity);
      const sparseWeights = weights.mul(sparseMask);

      // Scale to desired spectral radius
      const maxEigenvalue = this.approximateMaxEigenvalue(sparseWeights);
      return sparseWeights.div(maxEigenvalue).mul(this.config.spectralRadius);
    });
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