import React from 'react';
import { PerformanceMetrics } from '../components/PerformanceMetrics';
import { NetworkGraph } from '../components/NetworkGraph';
import { StorageMetrics } from '../components/StorageMetrics';

export function Monitoring() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Monitoring</h1>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              System Performance
            </h2>
            <PerformanceMetrics />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Network Status
              </h2>
              <NetworkGraph />
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Storage Usage
              </h2>
              <StorageMetrics />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}