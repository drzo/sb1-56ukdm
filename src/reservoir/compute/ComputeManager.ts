import { ESNConfig } from '../types/ESNTypes';
import { StateComputer } from './StateComputer';
import { OutputComputer } from './OutputComputer';
import { Logger } from '../../cogutil/Logger';
import { Timer } from '../../cogutil/Timer';
import * as tf from '@tensorflow/tfjs';

export class ComputeManager {
  private config: ESNConfig;
  private stateComputer: StateComputer;
  private outputComputer: OutputComputer;

  constructor(config: ESNConfig) {
    this.config = config;
    this.stateComputer = new StateComputer(
      config.activationFunction || 'tanh',
      config.leakingRate
    );
    this.outputComputer = new OutputComputer();
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
      
      const newState = await this.stateComputer.computeNextState(
        inputTensor,
        currentState,
        inputWeights,
        reservoirWeights
      );

      // Get state as array
      const stateArray = await newState.array();
      Logger.debug(`State computation completed in ${timer.stop()}ms`);
      return new Float32Array(stateArray[0]);
    } catch (error) {
      Logger.error('Failed to compute next state:', error);
      throw error;
    }
  }

  async computeOutput(state: tf.Tensor2D): Promise<Float32Array> {
    try {
      const output = await this.outputComputer.computeOutput(state);
      const outputArray = await output.array();
      return new Float32Array(outputArray[0]);
    } catch (error) {
      Logger.error('Failed to compute output:', error);
      throw error;
    }
  }

  setOutputWeights(weights: tf.Tensor2D): void {
    this.outputComputer.setOutputWeights(weights);
  }

  updateConfig(config: Partial<ESNConfig>): void {
    if (config.activationFunction) {
      this.stateComputer.setActivationFunction(config.activationFunction);
    }
    if (config.leakingRate) {
      this.stateComputer.setLeakingRate(config.leakingRate);
    }
  }

  dispose(): void {
    this.outputComputer.dispose();
  }
}