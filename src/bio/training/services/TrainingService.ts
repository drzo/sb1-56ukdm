import { 
  TrainingSession,
  TrainingScenario,
  ScenarioResult,
  SessionStats,
  TrainingMetrics 
} from '../types';
import { TrainingHistoryManager } from '../TrainingHistory';
import { ProfileService } from './ProfileService';
import { Logger } from '../../../cogutil/Logger';

export class TrainingService {
  private static instance: TrainingService;
  private profileService: ProfileService;

  private constructor() {
    this.profileService = ProfileService.getInstance();
  }

  public static getInstance(): TrainingService {
    if (!TrainingService.instance) {
      TrainingService.instance = new TrainingService();
    }
    return TrainingService.instance;
  }

  async startTraining(
    profileId: string,
    scenario: TrainingScenario
  ): Promise<ScenarioResult> {
    try {
      const startTime = Date.now();
      const profile = await this.profileService.getProfile(profileId);
      if (!profile) throw new Error('Profile not found');

      // Check requirements
      if (scenario.requirements) {
        this.validateRequirements(profile, scenario.requirements);
      }

      // Run training simulation
      const result = await this.runSimulation(profile, scenario);

      // Create and save session
      const session: TrainingSession = {
        id: crypto.randomUUID(),
        profileId,
        scenarioId: scenario.id,
        startTime,
        endTime: Date.now(),
        metrics: result.metrics,
        achievements: result.achievements
      };

      await TrainingHistoryManager.saveSession(session);

      // Update profile
      await this.updateProfileAfterTraining(profile, result);

      return result;
    } catch (error) {
      Logger.error('Training failed:', error);
      throw error;
    }
  }

  private validateRequirements(
    profile: CharacterProfile,
    requirements: TrainingScenario['requirements']
  ): void {
    if (requirements.minLevel && profile.experience < requirements.minLevel) {
      throw new Error(`Required level: ${requirements.minLevel}`);
    }

    if (requirements.traits) {
      for (const [trait, value] of Object.entries(requirements.traits)) {
        const profileTrait = profile.traits.find(t => t.name === trait);
        if (!profileTrait || profileTrait.value < value) {
          throw new Error(`Required ${trait} level: ${value}`);
        }
      }
    }

    if (requirements.achievements) {
      for (const achievement of requirements.achievements) {
        if (!profile.achievements.includes(achievement)) {
          throw new Error(`Required achievement: ${achievement}`);
        }
      }
    }
  }

  private async runSimulation(
    profile: CharacterProfile,
    scenario: TrainingScenario
  ): Promise<ScenarioResult> {
    // Calculate base metrics
    const baseMetrics = this.calculateBaseMetrics(profile, scenario);

    // Apply scenario conditions
    const finalMetrics = this.applyScenarioConditions(baseMetrics, scenario.conditions);

    // Calculate score and determine success
    const score = Object.values(finalMetrics).reduce((sum, value) => sum + value, 0) / 
      Object.keys(finalMetrics).length;

    const success = score >= 0.6;

    // Generate achievements
    const achievements = this.generateAchievements(score, scenario);

    return {
      scenarioId: scenario.id,
      success,
      score,
      metrics: {
        ...finalMetrics,
        timestamp: Date.now()
      },
      achievements,
      duration: scenario.duration
    };
  }

  private calculateBaseMetrics(
    profile: CharacterProfile,
    scenario: TrainingScenario
  ): TrainingMetrics {
    const basePerformance = profile.traits.reduce(
      (sum, trait) => sum + trait.value,
      0
    ) / profile.traits.length;

    return {
      accuracy: basePerformance,
      efficiency: basePerformance,
      adaptability: basePerformance,
      stressResponse: basePerformance,
      timestamp: Date.now()
    };
  }

  private applyScenarioConditions(
    metrics: TrainingMetrics,
    conditions: Record<string, number>
  ): TrainingMetrics {
    const result = { ...metrics };
    const difficultyFactor = 1 - (Object.values(conditions).reduce((a, b) => a + b, 0) / 
      Object.keys(conditions).length * 0.1);

    for (const [condition, value] of Object.entries(conditions)) {
      switch (condition) {
        case 'stress':
          result.stressResponse *= value * difficultyFactor;
          break;
        case 'efficiency':
          result.efficiency *= value * difficultyFactor;
          break;
        case 'adaptability':
          result.adaptability *= value * difficultyFactor;
          break;
        default:
          result.accuracy *= value * difficultyFactor;
      }
    }

    return result;
  }

  private generateAchievements(score: number, scenario: TrainingScenario): string[] {
    const achievements: string[] = [];

    if (score > 0.8) {
      achievements.push(`High Performer: ${scenario.name}`);
    }
    if (score >= 0.6) {
      achievements.push(`Completed: ${scenario.name}`);
    }

    return achievements;
  }

  private async updateProfileAfterTraining(
    profile: CharacterProfile,
    result: ScenarioResult
  ): Promise<void> {
    // Update experience
    const experienceGain = result.success ? 1 : 0.5;
    await this.profileService.updateProfileExperience(
      profile.name,
      experienceGain
    );

    // Update achievements
    if (result.achievements.length > 0) {
      await this.profileService.updateProfileAchievements(
        profile.name,
        result.achievements
      );
    }
  }

  async getSessionStats(profileId: string): Promise<SessionStats> {
    try {
      const history = await TrainingHistoryManager.loadHistory();
      const profileSessions = history.sessions.filter(s => s.profileId === profileId);

      return {
        totalSessions: profileSessions.length,
        totalTime: profileSessions.reduce(
          (total, session) => total + ((session.endTime || 0) - session.startTime),
          0
        ),
        averageScore: profileSessions.reduce(
          (total, session) => total + this.calculateSessionScore(session.metrics),
          0
        ) / Math.max(1, profileSessions.length),
        completionRate: profileSessions.filter(
          s => s.achievements.some(a => a.startsWith('Completed:'))
        ).length / Math.max(1, profileSessions.length),
        achievements: Array.from(new Set(profileSessions.flatMap(s => s.achievements)))
      };
    } catch (error) {
      Logger.error('Failed to get session stats:', error);
      throw error;
    }
  }

  private calculateSessionScore(metrics: TrainingMetrics): number {
    return Object.values(metrics).reduce((sum, value) => {
      return typeof value === 'number' ? sum + value : sum;
    }, 0) / 4; // Divide by number of metric fields (excluding timestamp)
  }
}