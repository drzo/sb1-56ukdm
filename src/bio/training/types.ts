export interface TrainingMetrics {
  accuracy: number;
  efficiency: number;
  adaptability: number;
  stressResponse: number;
  timestamp: number;
}

export interface TrainingSession {
  id: string;
  profileId: string;
  scenarioId: string;
  startTime: number;
  endTime?: number;
  metrics: TrainingMetrics;
  achievements: string[];
}

export interface TrainingHistory {
  sessions: TrainingSession[];
  totalTime: number;
  averageMetrics: TrainingMetrics;
  achievements: Set<string>;
}

export interface TrainingConfig {
  maxDuration: number;
  difficultyScale: number;
  learningRate: number;
  adaptiveScaling: boolean;
}