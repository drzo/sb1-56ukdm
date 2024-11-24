import React from 'react';
import { BarChart, TrendingUp } from 'lucide-react';
import { useSimulationStore } from '../lib/store';

interface MetricProps {
  label: string;
  value: number;
  change?: number;
}

const Metric = React.memo(({ label, value, change }: MetricProps) => (
  <div className="bg-white rounded-lg p-4 shadow-sm">
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-500">{label}</span>
      {change != null && (
        <span className={`flex items-center text-sm ${
          change > 0 ? 'text-green-500' : 'text-red-500'
        }`}>
          <TrendingUp 
            className={`w-4 h-4 ${change < 0 ? 'transform rotate-180' : ''}`} 
          />
          {Math.abs(change)}%
        </span>
      )}
    </div>
    <div className="mt-1 text-2xl font-semibold">{value.toFixed(4)}</div>
  </div>
));

Metric.displayName = 'Metric';

export default function PerformanceMetrics() {
  const { metrics } = useSimulationStore();
  
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
        <BarChart className="w-5 h-5" />
        <h2>Performance Metrics</h2>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <Metric 
          label="Training MSE" 
          value={metrics.trainingMSE} 
          change={-2.5} 
        />
        <Metric 
          label="Validation MSE" 
          value={metrics.validationMSE} 
          change={1.2} 
        />
        <Metric 
          label="Spectral Radius" 
          value={metrics.spectralRadius} 
        />
        <Metric 
          label="Memory Capacity" 
          value={metrics.memoryCapacity} 
          change={3.8} 
        />
      </div>
    </div>
  );
}