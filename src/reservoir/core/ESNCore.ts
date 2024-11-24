import { ESNConfig, ESNState, TrainingData, ESNMetrics } from '../types/ESNTypes';
import { WeightManager } from '../weights/WeightManager';
import { StateManager } from '../state/StateManager';
import { ComputeManager } from '../compute/ComputeManager';
import { TrainingManager } from '../training/TrainingManager';
import { Logger } from '../../cogutil/Logger';
import { Timer } from '../../cogutil/Timer';
import * as tf from '@tensorflow/tfjs';

export class ESNCore {
  private readonly id: string;
  private readonly config: ESNConfig;
  private weightManager: WeightManager;
  private stateManager: StateManager;
  private computeManager: ComputeManager;
  private trainingManager: TrainingManager;
  private initialized: boolean = false;

  constructor(id: string, config: ESNConfig) {
    this.id = id;
    this.config = { ...config };
    this.weightManager = new WeightManager(this.config);
    this.stateManager = new StateManager(this.id, this.config);
    this.computeManager = new ComputeManager(this.config);
    this.trainingManager = new TrainingManager(this.config);
  }

  async initialize(): Promise<void> {
    const timer = new Timer();
    try {
      await tf.ready();
      await this.weightManager.initialize();
      await this.stateManager.initialize();
      this.initialized = true;
      Logger.info(`ESN Core ${this.id} initialized in ${timer.stop()}ms`);
    } catch (error) {
      Logger.error('ESN initialization failed:', error);
      throw error;
    }
  }

  async update(input: Float32Array): Promise<Float32Array> {
    if (!this.initialized) {
      throw new Error('ESN not initialized');
    }

    const timer = new Timer();
    try {
      const weights = this.weightManager.getWeights();
      const currentState = this.stateManager.getCurrentState();

      const newState = await this.computeManager.computeNextState(
        input,
        tf.tensor2d([Array.from(currentState)]),
        weights.inputWeights,
        weights.reservoirWeights
      );

      await this.stateManager.updateState(tf.tensor2d([Array.from(newState)]));
      Logger.debug(`ESN update completed in ${timer.stop()}ms`);
      return newState;
    } catch (error) {
      Logger.error('ESN update failed:', error);
      throw error;
    }
  }

  async train(data: TrainingData): Promise<ESNMetrics> {
    if (!this.initialized) {
      throw new Error('ESN not initialized');
    }

    const timer = new Timer();
    try {
      const metrics = await this.trainingManager.train(
        data,
        this.stateManager,
        this.weightManager
      );
      Logger.info(`ESN training completed in ${timer.stop()}ms`);
      return metrics;
    } catch (error) {
      Logger.error('ESN training failed:', error);
      throw error;
    }
  }

  getState(): ESNState {
    if (!this.initialized) {
      throw new Error('ESN not initialized');
    }

    return {
      weights: this.weightManager.getWeightsAsArrays(),
      state: this.stateManager.getCurrentState(),
      history: this.stateManager.getStateHistory(),
      timestamp: Date.now()
    };
  }

  getConfig(): ESNConfig {
    return { ...this.config };
  }

  dispose(): void {
    this.weightManager.dispose();
    this.stateManager.dispose();
    this.computeManager.dispose();
    this.trainingManager.dispose();
    this.initialized = false;
  }
}