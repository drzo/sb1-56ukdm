import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { useNetworkStore } from '../store/networkStore';

export function StorageMetrics() {
  const nodes = useNetworkStore((state) => state.nodes);

  const data = {
    labels: nodes.map((node) => node.id),
    datasets: [
      {
        data: nodes.map((node) => node.storage),
        backgroundColor: [
          '#10B981',
          '#3B82F6',
          '#6366F1',
          '#8B5CF6',
        ],
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  return (
    <div className="mt-4">
      <Doughnut data={data} options={options} />
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Storage Distribution</h3>
        <div className="space-y-2">
          {nodes.map((node) => (
            <div key={node.id} className="flex justify-between">
              <span className="text-sm text-gray-600">{node.id}</span>
              <span className="text-sm font-medium">{node.storage} MB</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}