import { ESNMetrics } from '../types/ESNTypes';
import { Logger } from '../../cogutil/Logger';

export class EarlyStopping {
  private bestMetrics: ESNMetrics | null = null;
  private patience: number;
  private minDelta: number;
  private counter: number;

  constructor(patience: number = 5, minDelta: number = 0.001) {
    this.patience = patience;
    this.minDelta = minDelta;
    this.counter = 0;
  }

  shouldStop(metrics: ESNMetrics): boolean {
    try {
      if (!this.bestMetrics || 
          metrics.accuracy > this.bestMetrics.accuracy + this.minDelta) {
        this.bestMetrics = metrics;
        this.counter = 0;
        return false;
      }

      this.counter++;
      const shouldStop = this.counter >= this.patience;
      
      if (shouldStop) {
        Logger.info('Early stopping triggered after ${this.counter} iterations');
      }

      return shouldStop;
    } catch (error) {
      Logger.error('Early stopping check failed:', error);
      return false;
    }
  }

  reset(): void {
    this.bestMetrics = null;
    this.counter = 0;
  }
}