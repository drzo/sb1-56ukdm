import { ESNConfig } from '../types/ESNTypes';
import { Logger } from '../../cogutil/Logger';
import * as tf from '@tensorflow/tfjs';

export class WeightInitializer {
  private config: ESNConfig;

  constructor(config: ESNConfig) {
    this.config = config;
  }

  async initialize(): Promise<{
    input: tf.Tensor2D;
    reservoir: tf.Tensor2D;
  }> {
    try {
      await tf.ready();

      // Initialize input weights with explicit shape
      const inputWeights = tf.tidy(() => {
        const weights = tf.randomUniform(
          [this.config.reservoirSize, this.config.inputSize],
          -1,
          1
        );
        return weights.mul(this.config.inputScaling);
      });

      // Initialize reservoir weights with explicit shape
      const reservoirWeights = tf.tidy(() => {
        const weights = tf.randomUniform(
          [this.config.reservoirSize, this.config.reservoirSize],
          -1,
          1
        );

        const sparseMask = tf.randomUniform(
          [this.config.reservoirSize, this.config.reservoirSize],
          0,
          1
        ).greater(1 - this.config.sparsity);

        // Apply sparsity
        const sparseWeights = weights.mul(sparseMask.asType('float32'));

        // Scale to desired spectral radius
        const maxEigenvalue = this.approximateMaxEigenvalue(sparseWeights);
        return sparseWeights.div(maxEigenvalue).mul(this.config.spectralRadius);
      });

      Logger.info('Weight initialization completed successfully');
      return { input: inputWeights, reservoir: reservoirWeights };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      Logger.error('Weight initialization failed:', message);
      throw new Error(`Weight initialization failed: ${message}`);
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