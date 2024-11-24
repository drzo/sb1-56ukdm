import React from 'react';
import { Clock, Zap, Activity } from 'lucide-react';

interface NodeMetricsProps {
  timestamp: number;
  energy: number;
  resonance: number;
}

export const NodeMetrics: React.FC<NodeMetricsProps> = ({
  timestamp,
  energy,
  resonance,
}) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="flex flex-col items-center p-3 bg-gray-800 rounded-lg">
        <Clock className="w-5 h-5 text-blue-400 mb-1" />
        <span className="text-xs text-gray-400">Created</span>
        <span className="text-sm text-white">
          {new Date(timestamp).toLocaleDateString()}
        </span>
      </div>
      
      <div className="flex flex-col items-center p-3 bg-gray-800 rounded-lg">
        <Zap className="w-5 h-5 text-yellow-400 mb-1" />
        <span className="text-xs text-gray-400">Energy</span>
        <span className="text-sm text-white">{energy.toFixed(1)}</span>
      </div>

      <div className="flex flex-col items-center p-3 bg-gray-800 rounded-lg">
        <Activity className="w-5 h-5 text-green-400 mb-1" />
        <span className="text-xs text-gray-400">Resonance</span>
        <span className="text-sm text-white">{resonance.toFixed(1)}</span>
      </div>
    </div>
  );
};