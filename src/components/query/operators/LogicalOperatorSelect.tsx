import React from 'react';
import { LogicalOperator } from '../../../lib/types';

interface LogicalOperatorSelectProps {
  value: LogicalOperator | undefined;
  onChange: (operator: LogicalOperator | undefined) => void;
}

export const LogicalOperatorSelect: React.FC<LogicalOperatorSelectProps> = ({ value, onChange }) => {
  return (
    <div className="flex-1">
      <label className="block text-sm font-medium mb-1">Logical Operator</label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value as LogicalOperator || undefined)}
        className="w-full border rounded p-2"
      >
        <option value="">None</option>
        <option value="AND">AND</option>
        <option value="OR">OR</option>
        <option value="NOT">NOT</option>
      </select>
    </div>
  );
};