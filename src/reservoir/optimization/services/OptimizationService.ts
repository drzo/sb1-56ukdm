import { ESNConfig, ESNMetrics } from '../../types/ESNTypes';
import { OptimizationStrategy } from '../strategies/OptimizationStrategy';
import { Logger } from '../../../cogutil/Logger';
import { Timer } from '../../../cogutil/Timer';

export class OptimizationService {
  private static instance: OptimizationService;
  private strategy: OptimizationStrategy;

  private constructor(strategy: OptimizationStrategy) {
    this.strategy = strategy;
  }

  public static getInstance(strategy: OptimizationStrategy): OptimizationService {
    if (!OptimizationService.instance) {
      OptimizationService.instance = new OptimizationService(strategy);
    }
    return OptimizationService.instance;
  }

  async optimizeConfig(
    baseConfig: ESNConfig,
    evaluateConfig: (config: ESNConfig) => Promise<ESNMetrics>
  ): Promise<{ config: ESNConfig; metrics: ESNMetrics }> {
    const timer = new Timer();
    try {
      const result = await this.strategy.optimize(baseConfig, evaluateConfig);
      Logger.info(`Optimization completed in ${timer.stop()}ms`);
      return result;
    } catch (error) {
      Logger.error('Optimization failed:', error);
      throw error;
    }
  }

  setStrategy(strategy: OptimizationStrategy): void {
    this.strategy = strategy;
  }
}