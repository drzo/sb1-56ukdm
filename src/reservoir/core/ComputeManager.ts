import { ESNConfig } from '../types/ESNTypes';
import { Logger } from '../../cogutil/Logger';
import { Timer } from '../../cogutil/Timer';
import * as tf from '@tensorflow/tfjs';

export class ComputeManager {
  private config: ESNConfig;

  constructor(config: ESNConfig) {
    this.config = config;
  }

  async computeNextState(
    input: Float32Array,
    currentState: tf.Tensor2D,
    inputWeights: tf.Tensor2D,
    reservoirWeights: tf.Tensor2D
  ): Promise<Float32Array> {
    const timer = new Timer();
    try {
      const inputTensor = tf.tensor2d([Array.from(input)], [1, input.length]);
      
      const newState = tf.tidy(() => {
        // Compute input and reservoir contributions
        const inputContribution = tf.matMul(inputTensor, inputWeights.transpose());
        const reservoirContribution = tf.matMul(currentState, reservoirWeights);
        
        // Combine contributions
        const preActivation = inputContribution.add(reservoirContribution);
        
        // Apply activation function
        const activation = this.applyActivation(preActivation);
        
        // Apply leaking rate
        return activation.mul(this.config.leakingRate)
          .add(currentState.mul(1 - this.config.leakingRate));
      });

      // Get state as array
      const stateArray = await newState.array();
      Logger.debug(`State computation completed in ${timer.stop()}ms`);
      return new Float32Array(stateArray[0]);
    } catch (error) {
      Logger.error('Failed to compute next state:', error);
      throw error;
    }
  }

  private applyActivation(tensor: tf.Tensor): tf.Tensor {
    switch (this.config.activationFunction) {
      case 'sigmoid':
        return tf.sigmoid(tensor);
      case 'relu':
        return tf.relu(tensor);
      case 'tanh':
      default:
        return tf.tanh(tensor);
    }
  }

  dispose(): void {
    // No tensors to dispose in this manager
  }
}