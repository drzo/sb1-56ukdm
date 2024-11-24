import React from 'react';
import { RecursiveOptions as RecursiveOptionsType } from '../../lib/types';

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
          <div className="space-y-2">
            <label className="block text-sm font-medium">Max Depth</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="1"
                max="10"
                value={options.maxDepth || 5}
                onChange={(e) => onChange({ ...options, maxDepth: parseInt(e.target.value) })}
                className="w-full"
              />
              <span className="text-sm w-8">{options.maxDepth || 5}</span>
            </div>
            <p className="text-xs text-gray-500">Maximum depth for recursive pattern matching</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="follow-links"
                checked={options.followLinks || false}
                onChange={(e) => onChange({ ...options, followLinks: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="follow-links" className="text-sm">Follow Links</label>
            </div>
            <p className="text-xs text-gray-500 ml-5">Follow outgoing links during pattern matching</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="detect-cycles"
                checked={options.detectCycles || false}
                onChange={(e) => onChange({ ...options, detectCycles: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="detect-cycles" className="text-sm">Detect Cycles</label>
            </div>
            <p className="text-xs text-gray-500 ml-5">Prevent infinite loops by detecting cycles in the graph</p>
          </div>
        </div>
      )}
    </div>
  );
};