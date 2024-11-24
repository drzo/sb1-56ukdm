import { TrainingMetrics } from './metrics';

export interface TrainingSession {
  id: string;
  profileId: string;
  scenarioId: string;
  startTime: number;
  endTime?: number;
  metrics: TrainingMetrics;
  achievements: string[];
}

export interface SessionStats {
  totalSessions: number;
  totalTime: number;
  averageScore: number;
  completionRate: number;
  achievements: string[];
}