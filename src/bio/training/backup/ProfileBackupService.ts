import { CharacterProfile } from '../types';
import { Logger } from '../../../cogutil/Logger';

export class ProfileBackupService {
  private static readonly BACKUP_PREFIX = 'profile_backup_';

  static async createBackup(profile: CharacterProfile): Promise<void> {
    try {
      const backupId = `${this.BACKUP_PREFIX}${profile.name}_${Date.now()}`;
      const backupData = {
        profile,
        timestamp: Date.now(),
        version: '1.0'
      };

      localStorage.setItem(backupId, JSON.stringify(backupData));
      Logger.info(`Profile backup created: ${backupId}`);
    } catch (error) {
      Logger.error('Failed to create profile backup:', error);
      throw error;
    }
  }

  static async listBackups(profileName: string): Promise<string[]> {
    try {
      const backups: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(`${this.BACKUP_PREFIX}${profileName}_`)) {
          backups.push(key);
        }
      }
      return backups.sort().reverse();
    } catch (error) {
      Logger.error('Failed to list profile backups:', error);
      return [];
    }
  }

  static async restoreBackup(backupId: string): Promise<CharacterProfile | null> {
    try {
      const backupData = localStorage.getItem(backupId);
      if (!backupData) return null;

      const { profile } = JSON.parse(backupData);
      Logger.info(`Profile restored from backup: ${backupId}`);
      return profile;
    } catch (error) {
      Logger.error('Failed to restore profile backup:', error);
      return null;
    }
  }

  static async deleteBackup(backupId: string): Promise<void> {
    try {
      localStorage.removeItem(backupId);
      Logger.info(`Profile backup deleted: ${backupId}`);
    } catch (error) {
      Logger.error('Failed to delete profile backup:', error);
      throw error;
    }
  }

  static async cleanupOldBackups(profileName: string, maxBackups: number = 5): Promise<void> {
    try {
      const backups = await this.listBackups(profileName);
      if (backups.length <= maxBackups) return;

      const toDelete = backups.slice(maxBackups);
      await Promise.all(toDelete.map(backupId => this.deleteBackup(backupId)));
      Logger.info(`Cleaned up ${toDelete.length} old backups for ${profileName}`);
    } catch (error) {
      Logger.error('Failed to cleanup old backups:', error);
      throw error;
    }
  }
}