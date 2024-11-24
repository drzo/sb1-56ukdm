import { ESNCore } from '../core/ESNCore';
import { TrainingData, ESNMetrics } from '../types/ESNTypes';
import { MetricsCalculator } from './MetricsCalculator';
import { TrainingCache } from './TrainingCache';
import { Logger } from '../../cogutil/Logger';
import { Timer } from '../../cogutil/Timer';

export class ESNTrainingService {
  private static instance: ESNTrainingService;
  private cache: TrainingCache;
  private metricsCalculator: MetricsCalculator;

  private constructor() {
    this.cache = new TrainingCache();
    this.metricsCalculator = new MetricsCalculator();
  }

  public static getInstance(): ESNTrainingService {
    if (!ESNTrainingService.instance) {
      ESNTrainingService.instance = new ESNTrainingService();
    }
    return ESNTrainingService.instance;
  }

  async trainNetwork(
    networkId: string,
    esn: ESNCore,
    data: TrainingData
  ): Promise<ESNMetrics> {
    const timer = new Timer();
    try {
      const { training, validation } = this.splitData(data);
      const metrics = await this.performTraining(esn, training, validation);
      this.cache.updateHistory(networkId, metrics);
      
      Logger.info(`Network ${networkId} trained in ${timer.stop()}ms`);
      return metrics;
    } catch (error) {
      Logger.error(`Training failed for network ${networkId}:`, error);
      throw error;
    }
  }

  private splitData(data: TrainingData): {
    training: TrainingData;
    validation?: TrainingData;
  } {
    if (!data.validationSplit) {
      return { training: data };
    }

    const splitIndex = Math.floor(
      data.inputs.length * (1 - data.validationSplit)
    );
    
    return {
      training: {
        inputs: data.inputs.slice(0, splitIndex),
        targets: data.targets.slice(0, splitIndex)
      },
      validation: {
        inputs: data.inputs.slice(splitIndex),
        targets: data.targets.slice(splitIndex)
      }
    };
  }

  private async performTraining(
    esn: ESNCore,
    training: TrainingData,
    validation?: TrainingData
  ): Promise<ESNMetrics> {
    const trainingMetrics = await esn.train(training);
    
    if (validation) {
      const validationMetrics = await this.metricsCalculator.calculateMetrics(
        esn,
        validation
      );
      return this.combineMetrics(trainingMetrics, validationMetrics);
    }

    return trainingMetrics;
  }

  private combineMetrics(
    training: ESNMetrics,
    validation: ESNMetrics
  ): ESNMetrics {
    return {
      accuracy: (training.accuracy + validation.accuracy) / 2,
      complexity: training.complexity,
      stability: (training.stability + validation.stability) / 2,
      memoryCapacity: training.memoryCapacity,
      kernelQuality: training.kernelQuality,
      timestamp: Date.now()
    };
  }

  getTrainingHistory(networkId: string): ESNMetrics[] {
    return this.cache.getHistory(networkId);
  }

  clearHistory(networkId: string): void {
    this.cache.clearHistory(networkId);
  }
}