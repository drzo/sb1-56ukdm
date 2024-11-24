export interface MitochondrialStatus {
  count: number;
  efficiency: number;
  fusion: number;
  fission: number;
  damage: number;
  energyOutput: number;
  personality?: {
    name: string;
    traits: Array<{
      name: string;
      value: number;
    }>;
  };
}

export interface MetabolicStatus {
  atpLevel: number;
  nutrientLevels: {
    glucose: number;
    oxygen: number;
    amino_acids: number;
  };
  stressLevel: number;
  redoxState: number;
}

export interface EnvironmentalSignals {
  nutrients: {
    glucose: number;
    oxygen: number;
    amino_acids: number;
  };
  stress: number;
  signals: Map<string, number>;
}

export interface NoveltyMetrics {
  behaviorDiversity: number;
  adaptationRate: number;
  creativityScore: number;
  innovationIndex: number;
}

export interface AutonomyMetrics {
  decisionIndependence: number;
  selfRegulation: number;
  proactiveActions: number;
  learningRate: number;
}