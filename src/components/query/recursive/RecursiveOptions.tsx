import React from 'react';
import { RecursiveOptions as RecursiveOptionsType } from '../../../lib/types';
import { RecursiveDepthControl } from './RecursiveDepthControl';
import { RecursiveToggle } from './RecursiveToggle';

interface RecursiveOptionsProps {
  options: RecursiveOptionsType;
  onChange: (options: RecursiveOptionsType) => void;
}

export const RecursiveOptions: React.FC<RecursiveOptionsProps> = ({ options, onChange }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm space-y-3">
      <div className="flex justify-between items-center">
        <h4 className="font-medium">Recursive Pattern Matching</h4>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="enable-recursive"
            checked={Object.keys(options).length > 0}
            onChange={(e) => {
              if (!e.target.checked) {
                onChange({});
              } else {
                onChange({ maxDepth: 5, followLinks: true, detectCycles: true });
              }
            }}
            className="rounded"
          />
          <label htmlFor="enable-recursive" className="text-sm">Enable</label>
        </div>
      </div>
      
      {Object.keys(options).length > 0 && (
        <div className="space-y-4 pt-2">
          <RecursiveDepthControl
            value={options.maxDepth || 5}
            onChange={(maxDepth) => onChange({ ...options, maxDepth })}
          />

          <RecursiveToggle
            label="Follow Links"
            description="Follow outgoing links during pattern matching"
            checked={options.followLinks || false}
            onChange={(followLinks) => onChange({ ...options, followLinks })}
          />

          <RecursiveToggle
            label="Detect Cycles"
            description="Prevent infinite loops by detecting cycles in the graph"
            checked={options.detectCycles || false}
            onChange={(detectCycles) => onChange({ ...options, detectCycles })}
          />
        </div>
      )}
    </div>
  );
};