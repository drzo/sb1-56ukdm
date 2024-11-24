import React, { useCallback, useEffect } from 'react';
import { Play } from 'lucide-react';
import { useSimulationStore } from '../lib/store';
import { generateTimeSeriesData } from '../lib/utils';
import { ReservoirComputer } from '../lib/reservoir';
import { Button } from './ui/button';
import NetworkVisualization from './NetworkVisualization';
import PerformanceMetrics from './PerformanceMetrics';
import ParameterControls from './ParameterControls';

export default function ReservoirDemo() {
  const {
    reservoir,
    parameters,
    isSimulating,
    activeNodes,
    setReservoir,
    setParameters,
    setMetrics,
    setSimulating,
    setActiveNodes
  } = useSimulationStore();

  useEffect(() => {
    const rc = new ReservoirComputer(
      parameters[0].value,
      1,
      1,
      parameters[1].value,
      parameters[3].value
    );
    setReservoir(rc);
    // Initialize with empty active nodes
    setActiveNodes([]);
  }, [parameters, setReservoir, setActiveNodes]);

  const runSimulation = useCallback(async () => {
    if (!reservoir) return;
    setSimulating(true);

    try {
      const [inputs, targets] = generateTimeSeriesData(1000);
      const splitIndex = Math.floor(inputs.length * 0.8);
      
      // Animate training process
      for (let i = 0; i < splitIndex; i += 10) {
        if (i % 50 === 0) {
          const activeIndices = Array.from(
            { length: 5 },
            () => Math.floor(Math.random() * parameters[0].value)
          );
          setActiveNodes(activeIndices);
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        reservoir.update(inputs[i]);
      }

      reservoir.train(
        inputs.slice(0, splitIndex),
        targets.slice(0, splitIndex)
      );
      
      let trainMSE = 0;
      let validMSE = 0;
      
      inputs.slice(0, splitIndex).forEach((input, i) => {
        const output = reservoir.update(input);
        trainMSE += Math.pow(output[0] - targets[i][0], 2);
      });
      
      inputs.slice(splitIndex).forEach((input, i) => {
        const output = reservoir.update(input);
        validMSE += Math.pow(output[0] - targets[i + splitIndex][0], 2);
      });
      
      setMetrics({
        trainingMSE: trainMSE / splitIndex,
        validationMSE: validMSE / (inputs.length - splitIndex),
        spectralRadius: parameters[1].value,
        memoryCapacity: reservoir.getStates().length / inputs.length
      });
    } catch (error) {
      console.error('Simulation error:', error);
    } finally {
      setSimulating(false);
      setActiveNodes([]);
    }
  }, [reservoir, parameters, setMetrics, setSimulating, setActiveNodes]);

  const networkData = reservoir ? {
    nodes: [
      { id: 0, group: 0, value: 1, type: 'input' },
      ...Array.from({ length: parameters[0].value }, (_, i) => ({
        id: i + 1,
        group: 1,
        value: Math.random(),
        type: 'reservoir' as const
      })),
      { id: parameters[0].value + 1, group: 2, value: 1, type: 'output' as const }
    ],
    links: [
      ...Array.from({ length: Math.floor(parameters[0].value * 0.3) }, () => ({
        source: 0,
        target: Math.floor(Math.random() * parameters[0].value) + 1,
        value: Math.random(),
        type: 'input' as const
      })),
      ...Array.from({ length: parameters[0].value * 2 }, () => ({
        source: Math.floor(Math.random() * parameters[0].value) + 1,
        target: Math.floor(Math.random() * parameters[0].value) + 1,
        value: Math.random(),
        type: 'reservoir' as const
      })),
      ...Array.from({ length: Math.floor(parameters[0].value * 0.3) }, () => ({
        source: Math.floor(Math.random() * parameters[0].value) + 1,
        target: parameters[0].value + 1,
        value: Math.random(),
        type: 'output' as const
      }))
    ]
  } : { nodes: [], links: [] };

  return (
    <div className="bg-gray-50 rounded-xl shadow-lg">
      <div className="p-6 grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-lg p-4 shadow-sm">
          <NetworkVisualization
            nodes={networkData.nodes}
            links={networkData.links}
            activeNodes={activeNodes || []}
          />
        </div>
        
        <div className="space-y-6">
          <ParameterControls />
          <PerformanceMetrics />
        </div>
      </div>

      <div className="p-4 border-t bg-white rounded-b-xl flex justify-end">
        <Button
          onClick={runSimulation}
          disabled={isSimulating}
          className="flex items-center space-x-2"
        >
          <Play className="w-4 h-4" />
          <span>{isSimulating ? 'Simulating...' : 'Run Simulation'}</span>
        </Button>
      </div>
    </div>
  );
}