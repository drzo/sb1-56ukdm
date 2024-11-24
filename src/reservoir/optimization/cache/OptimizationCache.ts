import { ESNConfig, ESNMetrics } from '../../types/ESNTypes';
import { Logger } from '../../../cogutil/Logger';

interface CacheEntry {
  config: ESNConfig;
  metrics: ESNMetrics;
  timestamp: number;
}

export class OptimizationCache {
  private cache: Map<string, CacheEntry>;
  private readonly maxSize: number;

  constructor(maxSize: number = 1000) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  add(config: ESNConfig, metrics: ESNMetrics): void {
    try {
      const key = this.getConfigKey(config);
      
      if (this.cache.size >= this.maxSize) {
        const oldestKey = Array.from(this.cache.entries())
          .sort(([, a], [, b]) => a.timestamp - b.timestamp)[0][0];
        this.cache.delete(oldestKey);
      }

      this.cache.set(key, {
        config,
        metrics,
        timestamp: Date.now()
      });

      Logger.debug(`Added optimization result to cache for config: ${key}`);
    } catch (error) {
      Logger.error('Failed to add to optimization cache:', error);
      throw error;
    }
  }

  get(config: ESNConfig): ESNMetrics | null {
    const key = this.getConfigKey(config);
    const entry = this.cache.get(key);
    return entry?.metrics || null;
  }

  private getConfigKey(config: ESNConfig): string {
    return JSON.stringify({
      spectralRadius: config.spectralRadius,
      inputScaling: config.inputScaling,
      leakingRate: config.leakingRate,
      sparsity: config.sparsity
    });
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}