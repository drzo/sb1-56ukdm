import { ESNState, ESNConfig } from '../types/ESNTypes';
import { ESNStateStore } from './ESNStateStore';
import { ESNStateValidator } from './ESNStateValidator';
import { ESNStateCache } from './ESNStateCache';
import { Logger } from '../../cogutil/Logger';
import { Timer } from '../../cogutil/Timer';
import * as tf from '@tensorflow/tfjs';

export class ESNStateManager {
  private readonly id: string;
  private readonly config: ESNConfig;
  private readonly store: ESNStateStore;
  private readonly cache: ESNStateCache;
  private readonly validator: ESNStateValidator;
  private currentState: ESNState;
  private stateHistory: ESNState[];
  private readonly maxHistorySize = 100;

  constructor(id: string, config: ESNConfig) {
    this.id = id;
    this.config = config;
    this.store = ESNStateStore.getInstance();
    this.cache = new ESNStateCache();
    this.validator = new ESNStateValidator(config);
    this.stateHistory = [];
    this.currentState = this.initializeState();
  }

  private initializeState(): ESNState {
    return {
      weights: {
        input: tf.zeros([this.config.reservoirSize, this.config.inputSize]).arraySync(),
        reservoir: tf.zeros([this.config.reservoirSize, this.config.reservoirSize]).arraySync(),
        output: []
      },
      state: new Array(this.config.reservoirSize).fill(0),
      history: [],
      timestamp: Date.now()
    };
  }

  async updateState(newState: ESNState): Promise<void> {
    const timer = new Timer();
    try {
      // Validate new state
      this.validator.validateState(newState);
      
      // Store previous state in history
      this.stateHistory.push({ ...this.currentState });
      if (this.stateHistory.length > this.maxHistorySize) {
        this.stateHistory.shift();
      }

      // Update current state
      this.currentState = { ...newState };

      // Cache state
      await this.cache.cacheState(this.id, newState);

      // Update store
      this.store.setState(this.id, newState);

      Logger.debug(`State updated in ${timer.stop()}ms`);
    } catch (error) {
      Logger.error('Failed to update state:', error);
      throw error;
    }
  }

  async loadState(): Promise<void> {
    try {
      // Try to load from cache first
      const cachedState = await this.cache.retrieveState(this.id);
      if (cachedState) {
        await this.updateState(cachedState);
        return;
      }

      // Fall back to store
      const storedState = this.store.getState(this.id);
      if (storedState) {
        await this.updateState(storedState);
      }
    } catch (error) {
      Logger.error('Failed to load state:', error);
      throw error;
    }
  }

  getCurrentState(): ESNState {
    return { ...this.currentState };
  }

  getStateHistory(): ESNState[] {
    return [...this.stateHistory];
  }

  async revertState(steps: number = 1): Promise<void> {
    if (steps <= 0 || this.stateHistory.length === 0) return;

    const revertIndex = Math.max(
      this.stateHistory.length - steps,
      0
    );
    const previousState = this.stateHistory[revertIndex];
    
    if (previousState) {
      await this.updateState(previousState);
      this.stateHistory = this.stateHistory.slice(0, revertIndex);
    }
  }

  async saveCheckpoint(): Promise<void> {
    try {
      await this.cache.createCheckpoint(this.id, this.currentState);
      Logger.info('State checkpoint created');
    } catch (error) {
      Logger.error('Failed to create checkpoint:', error);
      throw error;
    }
  }

  async loadCheckpoint(): Promise<void> {
    try {
      const checkpoint = await this.cache.loadCheckpoint(this.id);
      if (checkpoint) {
        await this.updateState(checkpoint);
        Logger.info('State checkpoint restored');
      }
    } catch (error) {
      Logger.error('Failed to load checkpoint:', error);
      throw error;
    }
  }

  dispose(): void {
    this.stateHistory = [];
    this.cache.clearCache();
    this.store.clearState(this.id);
  }
}