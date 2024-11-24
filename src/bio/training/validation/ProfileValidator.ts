import { CharacterProfile, PersonalityTrait } from '../types';
import { Logger } from '../../../cogutil/Logger';

export class ProfileValidator {
  static validateProfile(profile: CharacterProfile): void {
    try {
      this.validateName(profile.name);
      this.validateTraits(profile.traits);
      this.validateSpecialization(profile.specialization);
      this.validateExperience(profile.experience);
      this.validateAchievements(profile.achievements);
    } catch (error) {
      Logger.error('Profile validation failed:', error);
      throw error;
    }
  }

  private static validateName(name: string): void {
    if (!name || name.length < 3 || name.length > 50) {
      throw new Error('Name must be between 3 and 50 characters');
    }

    if (!/^[a-zA-Z0-9-]+$/.test(name)) {
      throw new Error('Name can only contain letters, numbers, and hyphens');
    }
  }

  private static validateTraits(traits: PersonalityTrait[]): void {
    if (!traits || traits.length === 0) {
      throw new Error('Profile must have at least one trait');
    }

    traits.forEach(trait => {
      if (!trait.name || trait.name.length === 0) {
        throw new Error('Trait must have a name');
      }

      if (typeof trait.value !== 'number' || trait.value < 0 || trait.value > 1) {
        throw new Error('Trait value must be between 0 and 1');
      }

      if (!trait.description || trait.description.length === 0) {
        throw new Error('Trait must have a description');
      }
    });
  }

  private static validateSpecialization(specialization: string): void {
    const validSpecializations = [
      'Energy Production',
      'Stress Response',
      'Network Communication',
      'Damage Repair'
    ];

    if (!validSpecializations.includes(specialization)) {
      throw new Error('Invalid specialization');
    }
  }

  private static validateExperience(experience: number): void {
    if (typeof experience !== 'number' || experience < 0) {
      throw new Error('Experience must be a non-negative number');
    }
  }

  private static validateAchievements(achievements: string[]): void {
    if (!Array.isArray(achievements)) {
      throw new Error('Achievements must be an array');
    }

    achievements.forEach(achievement => {
      if (!achievement || achievement.length === 0) {
        throw new Error('Achievement cannot be empty');
      }
    });
  }
}