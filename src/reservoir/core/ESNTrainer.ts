import * as tf from '@tensorflow/tfjs';
import { TrainingData, ESNMetrics } from '../types/ESNTypes';
import { ESNStateManager } from './ESNStateManager';
import { BatchProcessor } from '../training/BatchProcessor';
import { EarlyStopping } from '../training/EarlyStopping';
import { CrossValidator } from '../training/CrossValidator';
import { MetricsCalculator } from '../services/MetricsCalculator';
import { Logger } from '../../cogutil/Logger';
import { Timer } from '../../cogutil/Timer';

export class ESNTrainer {
  private stateManager: ESNStateManager;
  private batchProcessor: BatchProcessor;
  private earlyStopping: EarlyStopping;
  private crossValidator: CrossValidator;
  private metricsCalculator: MetricsCalculator;

  constructor(stateManager: ESNStateManager) {
    this.stateManager = stateManager;
    this.batchProcessor = new BatchProcessor();
    this.earlyStopping = new EarlyStopping();
    this.crossValidator = new CrossValidator();
    this.metricsCalculator = new MetricsCalculator();
  }

  async train(data: TrainingData): Promise<ESNMetrics> {
    const timer = new Timer();
    try {
      // Prepare cross-validation folds
      const folds = this.crossValidator.createFolds(data, 5);
      let bestMetrics: ESNMetrics | null = null;

      for (const { training, validation } of folds) {
        // Process in batches
        const batches = this.batchProcessor.createBatches(training);
        
        for (const batch of batches) {
          const metrics = await this.trainBatch(batch);
          
          // Validate and check early stopping
          const validationMetrics = await this.validate(validation);
          if (this.earlyStopping.shouldStop(validationMetrics)) {
            Logger.info('Early stopping triggered');
            break;
          }

          // Update best metrics
          if (!bestMetrics || validationMetrics.accuracy > bestMetrics.accuracy) {
            bestMetrics = validationMetrics;
          }
        }
      }

      Logger.info(`Training completed in ${timer.stop()}ms`);
      return bestMetrics!;
    } catch (error) {
      Logger.error('Training failed:', error);
      throw error;
    }
  }

  private async trainBatch(batch: TrainingData): Promise<ESNMetrics> {
    try {
      // Collect states
      const states = await this.collectStates(batch.inputs);
      
      // Train output weights
      const outputWeights = await this.trainOutputWeights(
        states,
        tf.tensor2d(batch.targets)
      );
      
      this.stateManager.setOutputWeights(outputWeights);

      // Calculate training metrics
      return await this.metricsCalculator.calculateMetrics(
        this.stateManager,
        batch
      );
    } catch (error) {
      Logger.error('Batch training failed:', error);
      throw error;
    }
  }

  private async collectStates(inputs: number[][]): Promise<tf.Tensor2D[]> {
    const states: tf.Tensor2D[] = [];
    
    for (const input of inputs) {
      await this.stateManager.updateState(new Float32Array(input));
      states.push(tf.tensor2d([Array.from(this.stateManager.getState().state)]));
    }

    return states;
  }

  private async trainOutputWeights(
    states: tf.Tensor2D[],
    targets: tf.Tensor2D
  ): Promise<tf.Tensor2D> {
    return tf.tidy(() => {
      const stateMatrix = tf.concat(states, 0);
      const lambda = 1e-6;
      const identity = tf.eye(stateMatrix.shape[1]).mul(lambda);
      const statesT = stateMatrix.transpose();
      
      return tf.matMul(
        tf.matMul(targets.transpose(), stateMatrix),
        tf.matMul(statesT, stateMatrix).add(identity).inverse()
      ).transpose();
    });
  }

  private async validate(data: TrainingData): Promise<ESNMetrics> {
    return this.metricsCalculator.calculateMetrics(
      this.stateManager,
      data
    );
  }
}