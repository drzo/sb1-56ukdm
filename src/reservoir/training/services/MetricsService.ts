import { ESNMetrics } from '../../types/ESNTypes';
import { Logger } from '../../../cogutil/Logger';

export class MetricsService {
  private static instance: MetricsService;
  private metricsHistory: Map<string, ESNMetrics[]>;

  private constructor() {
    this.metricsHistory = new Map();
  }

  public static getInstance(): MetricsService {
    if (!MetricsService.instance) {
      MetricsService.instance = new MetricsService();
    }
    return MetricsService.instance;
  }

  addMetrics(networkId: string, metrics: ESNMetrics): void {
    try {
      const history = this.metricsHistory.get(networkId) || [];
      history.push(metrics);
      this.metricsHistory.set(networkId, history);
      Logger.debug(`Added metrics for network ${networkId}`);
    } catch (error) {
      Logger.error('Failed to add metrics:', error);
      throw error;
    }
  }

  getMetricsHistory(networkId: string): ESNMetrics[] {
    return this.metricsHistory.get(networkId) || [];
  }

  getLatestMetrics(networkId: string): ESNMetrics | null {
    const history = this.metricsHistory.get(networkId) || [];
    return history.length > 0 ? history[history.length - 1] : null;
  }

  getAverageMetrics(networkId: string): ESNMetrics | null {
    const history = this.metricsHistory.get(networkId) || [];
    if (history.length === 0) return null;

    return {
      accuracy: history.reduce((sum, m) => sum + m.accuracy, 0) / history.length,
      stability: history.reduce((sum, m) => sum + m.stability, 0) / history.length,
      complexity: history.reduce((sum, m) => sum + m.complexity, 0) / history.length,
      timestamp: Date.now()
    };
  }

  clearMetrics(networkId: string): void {
    this.metricsHistory.delete(networkId);
  }
}