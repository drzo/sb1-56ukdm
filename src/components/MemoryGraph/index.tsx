import React from 'react';
import { HeightIndexedGraph } from './HeightIndexedGraph';
import { ControlPanel } from '../ControlPanel';
import { ErrorBoundary } from '../ErrorBoundary';

export const MemoryGraph: React.FC = () => {
  return (
    <ErrorBoundary>
      <div className="flex h-full bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden">
        <div className="flex-1 relative">
          <HeightIndexedGraph />
        </div>
        <div className="w-80 border-l border-gray-700 bg-gray-800 overflow-y-auto">
          <ControlPanel />
        </div>
      </div>
    </ErrorBoundary>
  );
};