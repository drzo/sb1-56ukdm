import React from 'react';
import { Activity, Zap, Brain } from 'lucide-react';
import { useInstanceStore } from '../../store/instanceStore';

interface InstanceMetricsProps {
  instanceId: string;
}

export const InstanceMetrics: React.FC<InstanceMetricsProps> = ({ instanceId }) => {
  const instanceState = useInstanceStore(state => state.instanceStates.get(instanceId));
  
  if (!instanceState) return null;

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-gray-800 p-3 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <Activity className="w-4 h-4 text-purple-400" />
          <span className="text-sm text-gray-300">Resonance</span>
        </div>
        <div className="text-xl font-bold text-white">
          {instanceState.metrics.resonance.toFixed(1)}
        </div>
      </div>

      <div className="bg-gray-800 p-3 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <Brain className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-gray-300">Attention</span>
        </div>
        <div className="text-xl font-bold text-white">
          {instanceState.metrics.attention.toFixed(1)}
        </div>
      </div>

      <div className="bg-gray-800 p-3 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <Zap className="w-4 h-4 text-yellow-400" />
          <span className="text-sm text-gray-300">Energy</span>
        </div>
        <div className="text-xl font-bold text-white">
          {instanceState.metrics.energy.toFixed(1)}
        </div>
      </div>
    </div>
  );
};