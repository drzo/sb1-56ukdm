import { ESNConfig, ESNState } from '../types/ESNTypes';
import { Logger } from '../../cogutil/Logger';
import { Timer } from '../../cogutil/Timer';
import * as tf from '@tensorflow/tfjs';

export class StateManager {
  private config: ESNConfig;
  private currentState: tf.Tensor2D;
  private stateHistory: Float32Array[];
  private readonly maxHistoryLength: number;

  constructor(config: ESNConfig, maxHistoryLength: number = 100) {
    this.config = config;
    this.currentState = tf.zeros([1, config.reservoirSize]);
    this.stateHistory = [];
    this.maxHistoryLength = maxHistoryLength;
  }

  async initialize(): Promise<void> {
    const timer = new Timer();
    try {
      // Initialize with random state
      this.currentState = tf.randomNormal([1, this.config.reservoirSize], 0, 0.1);
      Logger.info(`StateManager initialized in ${timer.stop()}ms`);
    } catch (error) {
      Logger.error('Failed to initialize StateManager:', error);
      throw error;
    }
  }

  async updateState(newState: tf.Tensor2D): Promise<Float32Array> {
    try {
      // Store current state in history
      const currentArray = await this.currentState.array();
      this.stateHistory.push(new Float32Array(currentArray[0]));
      
      // Trim history if needed
      if (this.stateHistory.length > this.maxHistoryLength) {
        this.stateHistory.shift();
      }

      // Update current state
      this.currentState.dispose();
      this.currentState = newState;

      // Return new state as Float32Array
      const stateArray = await newState.array();
      return new Float32Array(stateArray[0]);
    } catch (error) {
      Logger.error('Failed to update state:', error);
      throw error;
    }
  }

  getCurrentState(): Float32Array {
    return tf.tidy(() => {
      const stateArray = this.currentState.arraySync();
      return new Float32Array(stateArray[0]);
    });
  }

  getStateHistory(): Float32Array[] {
    return [...this.stateHistory];
  }

  dispose(): void {
    this.currentState.dispose();
    this.stateHistory = [];
  }
}