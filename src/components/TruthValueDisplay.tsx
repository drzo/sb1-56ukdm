import React from 'react';
import { TruthValue } from '../lib/types';

interface TruthValueDisplayProps {
  truthValue: TruthValue;
  label?: string;
}

export const TruthValueDisplay: React.FC<TruthValueDisplayProps> = ({ truthValue, label }) => {
  const percentage = (value: number) => `${(value * 100).toFixed(1)}%`;
  
  return (
    <div className="bg-gray-50 p-3 rounded-md">
      {label && <div className="font-semibold mb-1">{label}</div>}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-gray-600">Strength:</span>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: percentage(truthValue.strength) }}
            />
          </div>
          <span className="text-xs">{percentage(truthValue.strength)}</span>
        </div>
        <div>
          <span className="text-gray-600">Confidence:</span>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-green-600 h-2.5 rounded-full"
              style={{ width: percentage(truthValue.confidence) }}
            />
          </div>
          <span className="text-xs">{percentage(truthValue.confidence)}</span>
        </div>
      </div>
    </div>
  );
};