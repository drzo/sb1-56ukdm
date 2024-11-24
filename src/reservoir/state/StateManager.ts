import { ESNConfig, ESNState } from '../types/ESNTypes';
import { ESNStateStore } from './ESNStateStore';
import { ESNStateValidator } from './ESNStateValidator';
import { ESNStateMiddleware } from './ESNStateMiddleware';
import { Logger } from '../../cogutil/Logger';
import { Timer } from '../../cogutil/Timer';
import * as tf from '@tensorflow/tfjs';

export class StateManager {
  private readonly id: string;
  private readonly config: ESNConfig;
  private readonly store: ESNStateStore;
  private readonly validator: ESNStateValidator;
  private readonly middleware: ESNStateMiddleware;
  private currentState: tf.Tensor2D;
  private stateHistory: Float32Array[];
  private readonly maxHistoryLength: number;

  constructor(id: string, config: ESNConfig, maxHistoryLength: number = 100) {
    this.id = id;
    this.config = config;
    this.store = ESNStateStore.getInstance();
    this.validator = new ESNStateValidator(config);
    this.middleware = new ESNStateMiddleware(config);
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

      // Process through middleware
      const processedState = await this.middleware.processState({
        weights: {
          input: [],
          reservoir: [],
          output: []
        },
        state: await newState.array()[0],
        history: this.stateHistory,
        timestamp: Date.now()
      });

      // Store in global store
      this.store.setState(this.id, processedState);

      // Return new state as Float32Array
      return new Float32Array(processedState.state);
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