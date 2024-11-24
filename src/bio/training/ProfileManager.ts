import { CharacterProfile } from './MitochondrialProfile';
import { Logger } from '../../cogutil/Logger';

export class ProfileManager {
  private static readonly PROFILE_PATH = '/data/profiles/';

  static async saveProfile(profile: CharacterProfile): Promise<void> {
    try {
      const fileName = `${profile.name}.json`;
      const content = JSON.stringify(profile, null, 2);
      
      // In a browser environment, we'll use localStorage as a fallback
      localStorage.setItem(`profile_${profile.name}`, content);
      
      Logger.info(`Saved profile for ${profile.name}`);
    } catch (error) {
      Logger.error('Failed to save profile:', error);
      throw error;
    }
  }

  static async loadProfile(name: string): Promise<CharacterProfile | null> {
    try {
      // Try to load from localStorage in browser environment
      const content = localStorage.getItem(`profile_${name}`);
      if (!content) return null;
      
      return JSON.parse(content) as CharacterProfile;
    } catch (error) {
      Logger.error('Failed to load profile:', error);
      return null;
    }
  }

  static async listProfiles(): Promise<string[]> {
    try {
      // List profiles from localStorage
      const profiles: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('profile_')) {
          profiles.push(key.replace('profile_', ''));
        }
      }
      return profiles;
    } catch (error) {
      Logger.error('Failed to list profiles:', error);
      return [];
    }
  }

  static async deleteProfile(name: string): Promise<void> {
    try {
      localStorage.removeItem(`profile_${name}`);
      Logger.info(`Deleted profile ${name}`);
    } catch (error) {
      Logger.error('Failed to delete profile:', error);
      throw error;
    }
  }
}