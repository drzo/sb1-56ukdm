import { ESNConfig, ESNMetrics, TrainingData } from '../../types/ESNTypes';
import { StateManager } from '../../state/StateManager';
import { WeightManager } from '../../weights/WeightManager';
import { TrainingStrategy } from '../strategies/TrainingStrategy';
import { RidgeRegressionStrategy } from '../strategies/RidgeRegressionStrategy';
import { ForceStrategy } from '../strategies/ForceStrategy';
import { Logger } from '../../../cogutil/Logger';
import { Timer } from '../../../cogutil/Timer';

export class TrainingService {
  private static instance: TrainingService;
  private strategy: TrainingStrategy;

  private constructor() {
    this.strategy = new RidgeRegressionStrategy();
  }

  public static getInstance(): TrainingService {
    if (!TrainingService.instance) {
      TrainingService.instance = new TrainingService();
    }
    return TrainingService.instance;
  }

  async trainNetwork(
    data: TrainingData,
    stateManager: StateManager,
    weightManager: WeightManager,
    config: ESNConfig
  ): Promise<ESNMetrics> {
    const timer = new Timer();
    try {
      const metrics = await this.strategy.train(
        data,
        stateManager,
        weightManager,
        config
      );

      Logger.info(`Network training completed in ${timer.stop()}ms`);
      return metrics;
    } catch (error) {
      Logger.error('Network training failed:', error);
      throw error;
    }
  }

  async validateNetwork(
    data: TrainingData,
    stateManager: StateManager,
    weightManager: WeightManager
  ): Promise<ESNMetrics> {
    try {
      return await this.strategy.validate(
        data,
        stateManager,
        weightManager
      );
    } catch (error) {
      Logger.error('Network validation failed:', error);
      throw error;
    }
  }

  setStrategy(strategy: 'ridge' | 'force'): void {
    this.strategy = strategy === 'ridge' ?
      new RidgeRegressionStrategy() :
      new ForceStrategy();
  }
}