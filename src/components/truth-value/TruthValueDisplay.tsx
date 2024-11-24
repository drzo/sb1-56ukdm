import React from 'react';
import { TruthValue } from '../../lib/types';
import { TruthValueBar } from './TruthValueBar';
import { TruthValueLabel } from './TruthValueLabel';

interface TruthValueDisplayProps {
  truthValue: TruthValue;
  label?: string;
}

export const TruthValueDisplay: React.FC<TruthValueDisplayProps> = ({ truthValue, label }) => {
  return (
    <div className="bg-gray-50 p-3 rounded-md">
      {label && <TruthValueLabel label={label} />}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <TruthValueBar 
          value={truthValue.strength}
          label="Strength"
          color="blue"
        />
        <TruthValueBar 
          value={truthValue.confidence}
          label="Confidence"
          color="green"
        />
      </div>
    </div>
  );
};