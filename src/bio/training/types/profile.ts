export interface PersonalityTrait {
  name: string;
  value: number;
  description: string;
}

export interface CharacterProfile {
  name: string;
  traits: PersonalityTrait[];
  specialization: string;
  experience: number;
  achievements: string[];
}

export interface ProfileStats {
  level: number;
  totalExperience: number;
  trainingTime: number;
  successRate: number;
  specializations: Record<string, number>;
}