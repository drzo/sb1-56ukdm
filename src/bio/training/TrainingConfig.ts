import { TrainingConfig } from './types';
import { Logger } from '../../cogutil/Logger';

export class TrainingConfigManager {
  private static readonly CONFIG_KEY = 'training_config';
  private static instance: TrainingConfigManager;
  private config: TrainingConfig;

  private constructor() {
    this.config = this.loadConfig();
  }

  public static getInstance(): TrainingConfigManager {
    if (!TrainingConfigManager.instance) {
      TrainingConfigManager.instance = new TrainingConfigManager();
    }
    return TrainingConfigManager.instance;
  }

  private loadConfig(): TrainingConfig {
    try {
      const stored = localStorage.getItem(TrainingConfigManager.CONFIG_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      Logger.error('Failed to load training config:', error);
    }

    return this.getDefaultConfig();
  }

  private getDefaultConfig(): TrainingConfig {
    return {
      maxDuration: 3600, // 1 hour in seconds
      difficultyScale: 1.0,
      learningRate: 0.1,
      adaptiveScaling: true
    };
  }

  public getConfig(): TrainingConfig {
    return { ...this.config };
  }

  public async updateConfig(updates: Partial<TrainingConfig>): Promise<void> {
    try {
      this.config = {
        ...this.config,
        ...updates
      };
      await this.saveConfig();
      Logger.info('Training config updated');
    } catch (error) {
      Logger.error('Failed to update training config:', error);
      throw error;
    }
  }

  private async saveConfig(): Promise<void> {
    try {
      localStorage.setItem(
        TrainingConfigManager.CONFIG_KEY,
        JSON.stringify(this.config)
      );
    } catch (error) {
      Logger.error('Failed to save training config:', error);
      throw error;
    }
  }

  public resetConfig(): void {
    this.config = this.getDefaultConfig();
    this.saveConfig();
    Logger.info('Training config reset to defaults');
  }
}