import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import * as d3 from 'd3';

export default function CogUtils() {
  const [units, setUnits] = useState(32);
  const [inputScaling, setInputScaling] = useState(0.5);
  const [spectralRadius, setSpectralRadius] = useState(0.9);

  const { data: state, refetch } = useQuery({
    queryKey: ['cogutils'],
    queryFn: async () => {
      const response = await fetch('/api/cogutils/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ units, inputScaling, spectralRadius })
      });
      return response.json();
    },
    enabled: false
  });

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold mb-6 dark:text-white">
          CogUtils ReservoirPy Integration
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Units
            </label>
            <input
              type="number"
              value={units}
              onChange={(e) => setUnits(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Input Scaling
            </label>
            <input
              type="number"
              step="0.1"
              value={inputScaling}
              onChange={(e) => setInputScaling(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Spectral Radius
            </label>
            <input
              type="number"
              step="0.1"
              value={spectralRadius}
              onChange={(e) => setSpectralRadius(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>

        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Process
        </button>

        {state && (
          <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <h3 className="text-lg font-medium mb-4 dark:text-white">
              Reservoir State
            </h3>
            <pre className="text-sm text-gray-700 dark:text-gray-300 overflow-auto">
              {JSON.stringify(state, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}