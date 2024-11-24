import { useCallback, useState } from 'react';
import { ReservoirComputer } from '../reservoir';
import { generateTimeSeriesData, calculateMSE } from '../utils';
import type { SimulationMetrics } from '../types';

export function useSimulation(reservoir: ReservoirComputer | null) {
  const [isSimulating, setSimulating] = useState(false);
  const [metrics, setMetrics] = useState<SimulationMetrics>({
    trainingMSE: 0,
    validationMSE: 0,
    spectralRadius: 0.9,
    memoryCapacity: 0
  });

  const runSimulation = useCallback(async (
    onProgress?: (activeNodes: number[]) => void
  ) => {
    if (!reservoir) return;
    setSimulating(true);

    try {
      const [inputs, targets] = generateTimeSeriesData(1000);
      const splitIndex = Math.floor(inputs.length * 0.8);
      
      // Training phase
      for (let i = 0; i < splitIndex; i += 10) {
        if (i % 50 === 0 && onProgress) {
          const activeIndices = Array.from(
            { length: 5 },
            () => Math.floor(Math.random() * reservoir.getParameters().size)
          );
          onProgress(activeIndices);
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        reservoir.update(inputs[i]);
      }

      // Train readout
      reservoir.train(
        inputs.slice(0, splitIndex),
        targets.slice(0, splitIndex)
      );
      
      // Calculate metrics
      const trainPredictions = inputs.slice(0, splitIndex)
        .map(input => reservoir.update(input));
      const validPredictions = inputs.slice(splitIndex)
        .map(input => reservoir.update(input));
      
      setMetrics({
        trainingMSE: calculateMSE(trainPredictions, targets.slice(0, splitIndex)),
        validationMSE: calculateMSE(validPredictions, targets.slice(splitIndex)),
        spectralRadius: reservoir.getParameters().spectralRadius,
        memoryCapacity: reservoir.getStates().length / inputs.length
      });
    } catch (error) {
      console.error('Simulation error:', error);
    } finally {
      setSimulating(false);
      if (onProgress) onProgress([]);
    }
  }, [reservoir]);

  return {
    isSimulating,
    metrics,
    runSimulation
  };
}