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

export interface ScenarioResult {
  scenarioId: string;
  success: boolean;
  score: number;
  metrics: TrainingMetrics;
  achievements: string[];
  duration: number;
}