import { ESNMetrics } from '../../types/ESNTypes';
import { Logger } from '../../../cogutil/Logger';

export class OptimizationMetrics {
  private history: Array<{
    iteration: number;
    bestMetrics: ESNMetrics;
    averageMetrics: ESNMetrics;
    timestamp: number;
  }> = [];

  addIteration(
    iteration: number,
    population: Array<{ metrics: ESNMetrics }>
  ): void {
    try {
      const bestMetrics = this.getBestMetrics(population);
      const averageMetrics = this.getAverageMetrics(population);

      this.history.push({
        iteration,
        bestMetrics,
        averageMetrics,
        timestamp: Date.now()
      });

      Logger.debug(`Added metrics for iteration ${iteration}`);
    } catch (error) {
      Logger.error('Failed to add optimization metrics:', error);
      throw error;
    }
  }

  private getBestMetrics(population: Array<{ metrics: ESNMetrics }>): ESNMetrics {
    return population.reduce((best, current) => {
      const currentScore = current.metrics.accuracy + current.metrics.stability;
      const bestScore = best.accuracy + best.stability;
      return currentScore > bestScore ? current.metrics : best;
    }, population[0].metrics);
  }

  private getAverageMetrics(population: Array<{ metrics: ESNMetrics }>): ESNMetrics {
    const sum = population.reduce((acc, current) => ({
      accuracy: acc.accuracy + current.metrics.accuracy,
      stability: acc.stability + current.metrics.stability,
      complexity: acc.complexity + current.metrics.complexity,
      timestamp: Date.now()
    }), {
      accuracy: 0,
      stability: 0,
      complexity: 0,
      timestamp: Date.now()
    });

    return {
      accuracy: sum.accuracy / population.length,
      stability: sum.stability / population.length,
      complexity: sum.complexity / population.length,
      timestamp: Date.now()
    };
  }

  getHistory(): typeof this.history {
    return [...this.history];
  }

  getConvergenceRate(): number {
    if (this.history.length < 2) return 0;

    const improvements = this.history.slice(1).map((current, i) => {
      const previous = this.history[i];
      return (current.bestMetrics.accuracy - previous.bestMetrics.accuracy) /
             (current.timestamp - previous.timestamp);
    });

    return improvements.reduce((a, b) => a + b, 0) / improvements.length;
  }

  clear(): void {
    this.history = [];
  }
}