import { Logger } from '../../cogutil/Logger';
import { ProfileManager } from './ProfileManager';

export interface PersonalityTrait {
  name: string;
  value: number; // 0-1 scale
  description: string;
}

export interface CharacterProfile {
  name: string;
  traits: PersonalityTrait[];
  specialization: string;
  experience: number;
  achievements: string[];
}

export class MitochondrialProfile {
  private profile: CharacterProfile;
  private readonly defaultTraits: PersonalityTrait[] = [
    {
      name: 'Efficiency',
      value: 0.7,
      description: 'Ability to optimize energy production'
    },
    {
      name: 'Adaptability',
      value: 0.6,
      description: 'Capacity to respond to changing conditions'
    },
    {
      name: 'Cooperation',
      value: 0.8,
      description: 'Tendency to work well with other mitochondria'
    },
    {
      name: 'Resilience',
      value: 0.5,
      description: 'Ability to maintain function under stress'
    }
  ];

  constructor(name: string = this.generateName()) {
    this.profile = {
      name,
      traits: [...this.defaultTraits],
      specialization: this.assignSpecialization(),
      experience: 0,
      achievements: []
    };
    this.saveProfile();
    Logger.info(`Created mitochondrial profile for ${name}`);
  }

  private generateName(): string {
    const prefixes = ['Mito', 'Bio', 'Ener', 'Vita'];
    const suffixes = ['zyme', 'dria', 'pulse', 'flux'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    return `${prefix}${suffix}-${Math.floor(Math.random() * 1000)}`;
  }

  private assignSpecialization(): string {
    const specializations = [
      'Energy Production',
      'Stress Response',
      'Network Communication',
      'Damage Repair'
    ];
    return specializations[Math.floor(Math.random() * specializations.length)];
  }

  private async saveProfile(): Promise<void> {
    await ProfileManager.saveProfile(this.profile);
  }

  updateTrait(traitName: string, value: number): void {
    const trait = this.profile.traits.find(t => t.name === traitName);
    if (trait) {
      trait.value = Math.max(0, Math.min(1, value));
      this.saveProfile();
      Logger.debug(`Updated trait ${traitName} to ${value}`);
    }
  }

  addAchievement(achievement: string): void {
    this.profile.achievements.push(achievement);
    this.profile.experience += 1;
    this.saveProfile();
    Logger.info(`Added achievement: ${achievement}`);
  }

  getProfile(): CharacterProfile {
    return { ...this.profile };
  }

  evolve(performanceMetrics: any): void {
    // Evolve traits based on performance
    this.profile.traits.forEach(trait => {
      const relevantMetric = performanceMetrics[trait.name.toLowerCase()];
      if (relevantMetric !== undefined) {
        trait.value = trait.value * 0.9 + relevantMetric * 0.1;
      }
    });

    // Update experience
    this.profile.experience += 0.1;

    // Save updated profile
    this.saveProfile();
    Logger.debug(`Evolved profile for ${this.profile.name}`);
  }

  static async loadProfile(name: string): Promise<MitochondrialProfile | null> {
    const profileData = await ProfileManager.loadProfile(name);
    if (!profileData) return null;

    const profile = new MitochondrialProfile(name);
    profile.profile = profileData;
    return profile;
  }
}