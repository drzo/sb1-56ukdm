import React from 'react';
import { Sliders } from 'lucide-react';
import { useSimulationStore } from '../lib/store';
import { Button } from './ui/button';
import { Slider } from './ui/slider';

export default function ParameterControls() {
  const { parameters, setParameters } = useSimulationStore();

  const handleParameterChange = (index: number, value: number) => {
    setParameters(parameters.map((p, i) => 
      i === index ? { ...p, value } : p
    ));
  };

  const handleReset = () => {
    setParameters([
      { name: 'Reservoir Size', value: 100, min: 10, max: 1000, step: 10 },
      { name: 'Spectral Radius', value: 0.9, min: 0, max: 2, step: 0.1 },
      { name: 'Input Scaling', value: 0.1, min: 0, max: 1, step: 0.01 },
      { name: 'Leaking Rate', value: 0.3, min: 0, max: 1, step: 0.01 }
    ]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
          <Sliders className="w-5 h-5" />
          <h2>Network Parameters</h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
        >
          Reset
        </Button>
      </div>

      <div className="space-y-4">
        {parameters.map((param, index) => (
          <Slider
            key={param.name}
            label={param.name}
            min={param.min}
            max={param.max}
            step={param.step}
            value={param.value}
            onChange={(value) => handleParameterChange(index, value)}
          />
        ))}
      </div>
    </div>
  );
}