import { TrainingSession, TrainingHistory } from './types';
import { Logger } from '../../cogutil/Logger';

export class TrainingHistoryManager {
  private static readonly HISTORY_KEY = 'training_history';

  static async saveSession(session: TrainingSession): Promise<void> {
    if (!session || !session.id || !session.profileId) {
      throw new Error('Invalid training session data');
    }

    try {
      const history = await this.loadHistory();
      
      // Validate session data
      this.validateSession(session);
      
      history.sessions.push(session);
      this.updateHistoryStats(history);
      await this.saveHistory(history);
      
      Logger.info(`Training session ${session.id} saved`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Logger.error('Failed to save training session:', { error: errorMessage, sessionId: session.id });
      throw new Error(`Failed to save training session: ${errorMessage}`);
    }
  }

  private static validateSession(session: TrainingSession): void {
    if (!session.metrics || typeof session.metrics !== 'object') {
      throw new Error('Invalid session metrics');
    }

    const requiredMetrics = ['accuracy', 'efficiency', 'adaptability', 'stressResponse'];
    for (const metric of requiredMetrics) {
      if (typeof session.metrics[metric as keyof TrainingMetrics] !== 'number') {
        throw new Error(`Missing or invalid metric: ${metric}`);
      }
    }

    if (!Array.isArray(session.achievements)) {
      throw new Error('Invalid session achievements');
    }
  }

  static async loadHistory(): Promise<TrainingHistory> {
    try {
      const stored = localStorage.getItem(this.HISTORY_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      Logger.error('Failed to load training history:', error);
    }

    return {
      sessions: [],
      totalTime: 0,
      averageMetrics: {
        accuracy: 0,
        efficiency: 0,
        adaptability: 0,
        stressResponse: 0,
        timestamp: Date.now()
      },
      achievements: new Set()
    };
  }

  private static async saveHistory(history: TrainingHistory): Promise<void> {
    try {
      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      Logger.error('Failed to save training history:', error);
      throw error;
    }
  }

  private static updateHistoryStats(history: TrainingHistory): void {
    // Calculate total training time
    history.totalTime = history.sessions.reduce(
      (total, session) => total + ((session.endTime || 0) - session.startTime),
      0
    );

    // Calculate average metrics
    const metricSums = history.sessions.reduce(
      (sums, session) => {
        sums.accuracy += session.metrics.accuracy;
        sums.efficiency += session.metrics.efficiency;
        sums.adaptability += session.metrics.adaptability;
        sums.stressResponse += session.metrics.stressResponse;
        return sums;
      },
      {
        accuracy: 0,
        efficiency: 0,
        adaptability: 0,
        stressResponse: 0
      }
    );

    const sessionCount = Math.max(1, history.sessions.length);
    history.averageMetrics = {
      accuracy: metricSums.accuracy / sessionCount,
      efficiency: metricSums.efficiency / sessionCount,
      adaptability: metricSums.adaptability / sessionCount,
      stressResponse: metricSums.stressResponse / sessionCount,
      timestamp: Date.now()
    };

    // Update achievements set
    history.achievements = new Set(
      history.sessions.flatMap(s => s.achievements)
    );
  }

  static async clearHistory(): Promise<void> {
    try {
      localStorage.removeItem(this.HISTORY_KEY);
      Logger.info('Training history cleared');
    } catch (error) {
      Logger.error('Failed to clear training history:', error);
      throw error;
    }
  }
}