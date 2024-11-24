export enum ESNAtomType {
  RESERVOIR = 'ReservoirNode',
  STATE = 'StateNode',
  WEIGHT = 'WeightNode',
  CONFIG = 'ConfigNode'
}

export enum ESNLinkType {
  HAS_STATE = 'HasStateLink',
  HAS_WEIGHT = 'HasWeightLink',
  HAS_CONFIG = 'HasConfigLink',
  PROCESSES = 'ProcessesLink',
  CONNECTS = 'ConnectsLink'
}

export interface ESNAtomSpaceConfig {
  maxStates: number;
  stateRetention: number; // Time in ms to retain states
  compressionThreshold: number; // Size threshold for state compression
  indexingStrategy: 'hash' | 'tree';
}