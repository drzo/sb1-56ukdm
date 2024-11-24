import * as tf from '@tensorflow/tfjs';
import { ActivationManager } from './ActivationManager';
import { Logger } from '../../cogutil/Logger';

export class StateComputer {
  private activationManager: ActivationManager;
  private leakingRate: number;

  constructor(activationFunction: 'tanh' | 'sigmoid' | 'relu', leakingRate: number) {
    this.activationManager = new ActivationManager(activationFunction);
    this.leakingRate = leakingRate;
  }

  async computeNextState(
    input: tf.Tensor2D,
    currentState: tf.Tensor2D,
    inputWeights: tf.Tensor2D,
    reservoirWeights: tf.Tensor2D
  ): Promise<tf.Tensor2D> {
    try {
      return tf.tidy(() => {
        // Compute input and reservoir contributions
        const inputContribution = tf.matMul(input, inputWeights.transpose());
        const reservoirContribution = tf.matMul(currentState, reservoirWeights);
        
        // Combine contributions
        const preActivation = inputContribution.add(reservoirContribution);
        
        // Apply activation function
        const activation = this.activationManager.apply(preActivation);
        
        // Apply leaking rate
        return activation.mul(this.leakingRate)
          .add(currentState.mul(1 - this.leakingRate));
      });
    } catch (error) {
      Logger.error('Failed to compute next state:', error);
      throw error;
    }
  }

  setLeakingRate(rate: number): void {
    if (rate <= 0 || rate > 1) {
      throw new Error('Leaking rate must be between 0 and 1');
    }
    this.leakingRate = rate;
  }

  setActivationFunction(fn: 'tanh' | 'sigmoid' | 'relu'): void {
    this.activationManager.setActivationFunction(fn);
  }
}