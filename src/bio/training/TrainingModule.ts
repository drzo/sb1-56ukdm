import { v4 as uuidv4 } from 'uuid';
import { Logger } from '../../cogutil/Logger';
import { TrainingSession, TrainingMetrics } from './types';
import { TrainingHistoryManager } from './TrainingHistory';
import { MitochondrialProfile } from './MitochondrialProfile';
import { SessionRecoveryService } from './services/SessionRecoveryService';

export interface TrainingScenario {
  id: string;
  name: string;
  difficulty: number;
  objectives: string[];
  conditions: Record<string, number>;
  duration: number;
  requirements?: {
    minLevel?: number;
    traits?: Record<string, number>;
    achievements?: string[];
  };
}

export interface TrainingResult {
  scenarioId: string;
  success: boolean;
  score: number;
  metrics: TrainingMetrics;
  achievements: string[];
}

export class TrainingModule {
  private scenarios: Map<string, TrainingScenario>;
  private sessionRecovery: SessionRecoveryService;

  constructor() {
    this.scenarios = new Map();
    this.sessionRecovery = SessionRecoveryService.getInstance();
    this.initializeScenarios();
  }

  private initializeScenarios(): void {
    const defaultScenarios: TrainingScenario[] = [
      {
        id: 'energy_optimization',
        name: 'Energy Optimization Challenge',
        difficulty: 1,
        objectives: ['Maximize ATP production', 'Minimize waste'],
        conditions: {
          glucose: 0.8,
          oxygen: 0.9,
          stress: 0.2
        },
        duration: 300
      },
      {
        id: 'stress_response',
        name: 'Stress Response Training',
        difficulty: 2,
        objectives: ['Maintain function under stress', 'Repair damage'],
        conditions: {
          glucose: 0.5,
          oxygen: 0.6,
          stress: 0.7
        },
        duration: 600
      }
    ];

    defaultScenarios.forEach(scenario => {
      this.scenarios.set(scenario.id, scenario);
    });
  }

  async startTraining(
    scenarioId: string,
    profile: MitochondrialProfile
  ): Promise<TrainingResult> {
    try {
      const scenario = this.scenarios.get(scenarioId);
      if (!scenario) {
        throw new Error(`Scenario ${scenarioId} not found`);
      }

      // Create session
      const session: TrainingSession = {
        id: uuidv4(),
        profileId: profile.getProfile().name,
        scenarioId,
        startTime: Date.now(),
        metrics: {
          accuracy: 0,
          efficiency: 0,
          adaptability: 0,
          stressResponse: 0,
          timestamp: Date.now()
        },
        achievements: []
      };

      // Save session checkpoint
      await this.sessionRecovery.saveCheckpoint(session);

      // Run simulation
      const result = await this.runSimulation(profile, scenario);

      // Update session with results
      session.endTime = Date.now();
      session.metrics = result.metrics;
      session.achievements = result.achievements;

      // Save completed session
      await TrainingHistoryManager.saveSession(session).catch(error => {
        Logger.error('Failed to save training session:', error);
      });

      // Clear checkpoint
      await this.sessionRecovery.clearCheckpoint();

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Logger.error('Training failed:', { error: errorMessage, scenarioId });
      throw new Error(`Training failed: ${errorMessage}`);
    }
  }

  private async runSimulation(
    profile: MitochondrialProfile,
    scenario: TrainingScenario
  ): Promise<TrainingResult> {
    try {
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
        achievements
      };
    } catch (error) {
      Logger.error('Simulation failed:', error);
      throw error;
    }
  }

  private calculateBaseMetrics(
    profile: MitochondrialProfile,
    scenario: TrainingScenario
  ): TrainingMetrics {
    const basePerformance = profile.getProfile().traits.reduce(
      (sum, trait) => sum + trait.value,
      0
    ) / profile.getProfile().traits.length;

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
      const metricKey = this.mapConditionToMetric(condition);
      if (metricKey) {
        result[metricKey] = result[metricKey] * value * difficultyFactor;
      }
    }

    return result;
  }

  private mapConditionToMetric(condition: string): keyof TrainingMetrics | null {
    const mapping: Record<string, keyof TrainingMetrics> = {
      'glucose': 'efficiency',
      'oxygen': 'efficiency',
      'stress': 'stressResponse',
      'adaptability': 'adaptability'
    };
    return mapping[condition] || null;
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

  getScenarios(): TrainingScenario[] {
    return Array.from(this.scenarios.values());
  }

  async recoverSession(): Promise<TrainingSession | null> {
    try {
      return await this.sessionRecovery.loadCheckpoint();
    } catch (error) {
      Logger.error('Failed to recover session:', error);
      return null;
    }
  }
}