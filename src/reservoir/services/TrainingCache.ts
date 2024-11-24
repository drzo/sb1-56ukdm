import { ESNMetrics } from '../types/ESNTypes';
import { Logger } from '../../cogutil/Logger';

export class TrainingCache {
  private history: Map<string, ESNMetrics[]>;
  private readonly maxHistorySize = 1000;

  constructor() {
    this.history = new Map();
  }

  updateHistory(networkId: string, metrics: ESNMetrics): void {
    try {
      let networkHistory = this.history.get(networkId) || [];
      networkHistory = [...networkHistory, metrics];

      if (networkHistory.length > this.maxHistorySize) {
        networkHistory = networkHistory.slice(-this.maxHistorySize);
      }

      this.history.set(networkId, networkHistory);
      Logger.debug(`Updated history for network ${networkId}`);
    } catch (error) {
      Logger.error('Failed to update training history:', error);
      throw error;
    }
  }

  getHistory(networkId: string): ESNMetrics[] {
    return this.history.get(networkId) || [];
  }

  clearHistory(networkId: string): void {
    this.history.delete(networkId);
  }
}