import { ESNConfig, ESNMetrics } from '../types/ESNTypes';
import { GeneticOptimizer } from './strategies/GeneticOptimizer';
import { GridSearchOptimizer } from './strategies/GridSearchOptimizer';
import { RandomSearchOptimizer } from './strategies/RandomSearchOptimizer';
import { Logger } from '../../cogutil/Logger';
import { Timer } from '../../cogutil/Timer';

export type OptimizationStrategy = 'genetic' | 'grid' | 'random';

export class ESNOptimizer {
  private geneticOptimizer: GeneticOptimizer;
  private gridSearchOptimizer: GridSearchOptimizer;
  private randomSearchOptimizer: RandomSearchOptimizer;

  constructor() {
    this.geneticOptimizer = new GeneticOptimizer();
    this.gridSearchOptimizer = new GridSearchOptimizer();
    this.randomSearchOptimizer = new RandomSearchOptimizer();
  }

  async optimizeHyperparameters(
    baseConfig: ESNConfig,
    evaluateConfig: (config: ESNConfig) => Promise<ESNMetrics>,
    strategy: OptimizationStrategy = 'genetic'
  ): Promise<{ config: ESNConfig; metrics: ESNMetrics }> {
    const timer = new Timer();
    try {
      let result;
      
      switch (strategy) {
        case 'genetic':
          result = await this.geneticOptimizer.optimize(baseConfig, evaluateConfig);
          break;
        case 'grid':
          result = await this.gridSearchOptimizer.optimize(baseConfig, evaluateConfig);
          break;
        case 'random':
          result = await this.randomSearchOptimizer.optimize(baseConfig, evaluateConfig);
          break;
        default:
          throw new Error(`Unknown optimization strategy: ${strategy}`);
      }

      Logger.info(`Hyperparameter optimization completed in ${timer.stop()}ms using ${strategy} strategy`);
      return result;
    } catch (error) {
      Logger.error('Hyperparameter optimization failed:', error);
      throw error;
    }
  }
}