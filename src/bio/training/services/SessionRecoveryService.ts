import { TrainingSession } from '../types';
import { Logger } from '../../../cogutil/Logger';

export class SessionRecoveryService {
  private static readonly RECOVERY_KEY = 'training_session_recovery';
  private static instance: SessionRecoveryService;

  private constructor() {}

  public static getInstance(): SessionRecoveryService {
    if (!SessionRecoveryService.instance) {
      SessionRecoveryService.instance = new SessionRecoveryService();
    }
    return SessionRecoveryService.instance;
  }

  async saveCheckpoint(session: TrainingSession): Promise<void> {
    try {
      localStorage.setItem(
        SessionRecoveryService.RECOVERY_KEY,
        JSON.stringify(session)
      );
      Logger.info(`Training session checkpoint saved: ${session.id}`);
    } catch (error) {
      Logger.error('Failed to save session checkpoint:', error);
      throw error;
    }
  }

  async loadCheckpoint(): Promise<TrainingSession | null> {
    try {
      const stored = localStorage.getItem(SessionRecoveryService.RECOVERY_KEY);
      if (!stored) return null;
      return JSON.parse(stored);
    } catch (error) {
      Logger.error('Failed to load session checkpoint:', error);
      return null;
    }
  }

  async clearCheckpoint(): Promise<void> {
    try {
      localStorage.removeItem(SessionRecoveryService.RECOVERY_KEY);
      Logger.info('Training session checkpoint cleared');
    } catch (error) {
      Logger.error('Failed to clear session checkpoint:', error);
      throw error;
    }
  }
}