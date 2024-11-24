export interface TrainingMetrics {
  accuracy: number;
  efficiency: number;
  adaptability: number;
  stressResponse: number;
  timestamp: number;
}

export interface MetricsHistory {
  values: TrainingMetrics[];
  average: TrainingMetrics;
  best: TrainingMetrics;
  worst: TrainingMetrics;
  trend: {
    improving: boolean;
    rate: number;
  };
}