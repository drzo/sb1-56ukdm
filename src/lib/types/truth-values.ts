export interface TruthValue {
  strength: number;
  confidence: number;
}

export interface SimpleTruthValue extends TruthValue {
  type: 'simple';
}

export interface CountTruthValue extends TruthValue {
  type: 'count';
  count: number;
}

export interface IndefiniteTruthValue extends TruthValue {
  type: 'indefinite';
  l: number; // Lower bound
  u: number; // Upper bound
}