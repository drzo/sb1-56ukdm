import React from 'react';
import { TruthValueOperator } from '../../../lib/types';

interface TruthValueOperatorSelectProps {
  value: TruthValueOperator | undefined;
  onChange: (operator: TruthValueOperator | undefined) => void;
}

export const TruthValueOperatorSelect: React.FC<TruthValueOperatorSelectProps> = ({ value, onChange }) => {
  return (
    <div className="flex-1">
      <label className="block text-sm font-medium mb-1">Truth Value Operator</label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value as TruthValueOperator || undefined)}
        className="w-full border rounded p-2"
      >
        <option value="">None</option>
        <option value="REVISION">REVISION</option>
        <option value="DEDUCTION">DEDUCTION</option>
        <option value="INTERSECTION">INTERSECTION</option>
        <option value="UNION">UNION</option>
      </select>
    </div>
  );
};