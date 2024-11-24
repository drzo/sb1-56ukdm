import { Logger } from '../../cogutil/Logger';
import * as tf from '@tensorflow/tfjs';

export type ActivationFunction = 'tanh' | 'sigmoid' | 'relu';

export class ActivationManager {
  private activationFunction: ActivationFunction;

  constructor(activationFunction: ActivationFunction = 'tanh') {
    this.activationFunction = activationFunction;
  }

  apply(tensor: tf.Tensor): tf.Tensor {
    try {
      switch (this.activationFunction) {
        case 'sigmoid':
          return tf.sigmoid(tensor);
        case 'relu':
          return tf.relu(tensor);
        case 'tanh':
        default:
          return tf.tanh(tensor);
      }
    } catch (error) {
      Logger.error('Failed to apply activation function:', error);
      throw error;
    }
  }

  getDerivative(tensor: tf.Tensor): tf.Tensor {
    return tf.tidy(() => {
      switch (this.activationFunction) {
        case 'sigmoid':
          const sigValue = tf.sigmoid(tensor);
          return sigValue.mul(tf.scalar(1).sub(sigValue));
        case 'relu':
          return tf.step(tensor);
        case 'tanh':
        default:
          const tanhValue = tf.tanh(tensor);
          return tf.scalar(1).sub(tanhValue.square());
      }
    });
  }

  setActivationFunction(fn: ActivationFunction): void {
    this.activationFunction = fn;
  }

  getActivationFunction(): ActivationFunction {
    return this.activationFunction;
  }
}