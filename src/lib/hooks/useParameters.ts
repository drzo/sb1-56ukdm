import { useState, useCallback } from 'react';
import type { Parameter } from '../types';

const defaultParameters: Parameter[] = [
  { name: 'Reservoir Size', value: 100, min: 10, max: 1000, step: 10 },
  { name: 'Spectral Radius', value: 0.9, min: 0, max: 2, step: 0.1 },
  { name: 'Input Scaling', value: 0.1, min: 0, max: 1, step: 0.01 },
  { name: 'Leaking Rate', value: 0.3, min: 0, max: 1, step: 0.01 }
];

export function useParameters() {
  const [parameters, setParameters] = useState<Parameter[]>(defaultParameters);

  const updateParameter = useCallback((index: number, value: number) => {
    setParameters(prev => prev.map((p, i) => 
      i === index ? { ...p, value } : p
    ));
  }, []);

  const resetParameters = useCallback(() => {
    setParameters(defaultParameters);
  }, []);

  return {
    parameters,
    updateParameter,
    resetParameters
  };
}</bortAction>

<boltAction type="file" filePath="src/lib/constants.ts">export const NETWORK_CONFIG = {
  NODE_RADIUS: 6,
  ACTIVE_NODE_RADIUS: 15,
  LINK_OPACITY: 0.6,
  ANIMATION_DURATION: 200,
  SIMULATION_STRENGTH: -50,
  CONNECTION_RATIO: 0.3,
  RESERVOIR_DENSITY: 2
} as const;

export const COLORS = {
  INPUT: '#818cf8',
  RESERVOIR: '#9ca3af',
  OUTPUT: '#34d399',
  ACTIVE: 'rgba(99, 102, 241, 0.8)',
  ACTIVE_FADE: 'rgba(99, 102, 241, 0.2)'
} as const;

export const SIMULATION_CONFIG = {
  DATA_LENGTH: 1000,
  TRAINING_RATIO: 0.8,
  UPDATE_INTERVAL: 50,
  ANIMATION_DELAY: 100,
  ACTIVE_NODES_COUNT: 5
} as const;