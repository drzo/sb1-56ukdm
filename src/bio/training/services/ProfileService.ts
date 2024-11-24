import { CharacterProfile, ProfileStats } from '../types';
import { ProfileManager } from '../ProfileManager';
import { Logger } from '../../../cogutil/Logger';

export class ProfileService {
  private static instance: ProfileService;

  private constructor() {}

  public static getInstance(): ProfileService {
    if (!ProfileService.instance) {
      ProfileService.instance = new ProfileService();
    }
    return ProfileService.instance;
  }

  async getProfile(name: string): Promise<CharacterProfile | null> {
    try {
      return await ProfileManager.loadProfile(name);
    } catch (error) {
      Logger.error('Failed to load profile:', error);
      return null;
    }
  }

  async saveProfile(profile: CharacterProfile): Promise<void> {
    try {
      await ProfileManager.saveProfile(profile);
      Logger.info(`Profile saved: ${profile.name}`);
    } catch (error) {
      Logger.error('Failed to save profile:', error);
      throw error;
    }
  }

  async listProfiles(): Promise<string[]> {
    try {
      return await ProfileManager.listProfiles();
    } catch (error) {
      Logger.error('Failed to list profiles:', error);
      return [];
    }
  }

  async getProfileStats(name: string): Promise<ProfileStats | null> {
    try {
      const profile = await this.getProfile(name);
      if (!profile) return null;

      return {
        level: Math.floor(profile.experience),
        totalExperience: profile.experience,
        trainingTime: 0, // TODO: Calculate from training history
        successRate: 0, // TODO: Calculate from training history
        specializations: {
          [profile.specialization]: 1
        }
      };
    } catch (error) {
      Logger.error('Failed to get profile stats:', error);
      return null;
    }
  }

  async updateProfileAchievements(
    name: string, 
    achievements: string[]
  ): Promise<void> {
    try {
      const profile = await this.getProfile(name);
      if (!profile) throw new Error('Profile not found');

      profile.achievements = [...new Set([...profile.achievements, ...achievements])];
      await this.saveProfile(profile);
    } catch (error) {
      Logger.error('Failed to update achievements:', error);
      throw error;
    }
  }

  async updateProfileExperience(
    name: string,
    experienceGain: number
  ): Promise<void> {
    try {
      const profile = await this.getProfile(name);
      if (!profile) throw new Error('Profile not found');

      profile.experience += experienceGain;
      await this.saveProfile(profile);
    } catch (error) {
      Logger.error('Failed to update experience:', error);
      throw error;
    }
  }
}