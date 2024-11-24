import { create } from 'zustand';
import { ReservoirComputer } from './reservoir';
import type { SimulationMetrics, Parameter } from './types';

interface SimulationStore {
  reservoir: ReservoirComputer | null;
  parameters: Parameter[];
  metrics: SimulationMetrics;
  isSimulating: boolean;
  activeNodes: number[];
  setReservoir: (reservoir: ReservoirComputer) => void;
  setParameters: (parameters: Parameter[]) => void;
  setMetrics: (metrics: SimulationMetrics) => void;
  setSimulating: (isSimulating: boolean) => void;
  setActiveNodes: (nodes: number[]) => void;
}

export const useSimulationStore = create<SimulationStore>((set) => ({
  reservoir: null,
  parameters: [
    { name: 'Reservoir Size', value: 100, min: 10, max: 1000, step: 10 },
    { name: 'Spectral Radius', value: 0.9, min: 0, max: 2, step: 0.1 },
    { name: 'Input Scaling', value: 0.1, min: 0, max: 1, step: 0.01 },
    { name: 'Leaking Rate', value: 0.3, min: 0, max: 1, step: 0.01 }
  ],
  metrics: {
    trainingMSE: 0,
    validationMSE: 0,
    spectralRadius: 0.9,
    memoryCapacity: 0
  },
  isSimulating: false,
  activeNodes: [],
  setReservoir: (reservoir) => set({ reservoir }),
  setParameters: (parameters) => set({ parameters }),
  setMetrics: (metrics) => set({ metrics }),
  setSimulating: (isSimulating) => set({ isSimulating }),
  setActiveNodes: (nodes) => set({ activeNodes: nodes })
}));