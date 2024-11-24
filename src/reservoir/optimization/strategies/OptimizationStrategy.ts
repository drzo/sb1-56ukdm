import { ESNConfig, ESNMetrics } from '../../types/ESNTypes';

export interface OptimizationStrategy {
  optimize(
    baseConfig: ESNConfig,
    evaluateConfig: (config: ESNConfig) => Promise<ESNMetrics>
  ): Promise<{ config: ESNConfig; metrics: ESNMetrics }>;
}