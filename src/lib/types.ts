export interface Parameter {
  name: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
}

export interface SimulationMetrics {
  trainingMSE: number;
  validationMSE: number;
  spectralRadius: number;
  memoryCapacity: number;
}

export interface Node {
  id: number;
  group: number;
  value: number;
  type?: 'input' | 'reservoir' | 'output';
}

export interface Link {
  source: number;
  target: number;
  value: number;
  type?: 'input' | 'reservoir' | 'output';
}