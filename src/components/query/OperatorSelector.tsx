import React from 'react';
import { LogicalOperator, TruthValueOperator } from '../../lib/types';

interface OperatorSelectorProps {
  logicalOperator: LogicalOperator | undefined;
  tvOperator: TruthValueOperator | undefined;
  onLogicalOperatorChange: (op: LogicalOperator | undefined) => void;
  onTvOperatorChange: (op: TruthValueOperator | undefined) => void;
}

export const OperatorSelector: React.FC<OperatorSelectorProps> = ({
  logicalOperator,
  tvOperator,
  onLogicalOperatorChange,
  onTvOperatorChange
}) => {
  return (
    <div className="flex gap-4">
      <div className="flex-1">
        <label className="block text-sm font-medium mb-1">Logical Operator</label>
        <select
          value={logicalOperator || ''}
          onChange={(e) => onLogicalOperatorChange(e.target.value as LogicalOperator || undefined)}
          className="w-full border rounded p-2"
        >
          <option value="">None</option>
          <option value="AND">AND</option>
          <option value="OR">OR</option>
          <option value="NOT">NOT</option>
        </select>
      </div>

      <div className="flex-1">
        <label className="block text-sm font-medium mb-1">Truth Value Operator</label>
        <select
          value={tvOperator || ''}
          onChange={(e) => onTvOperatorChange(e.target.value as TruthValueOperator || undefined)}
          className="w-full border rounded p-2"
        >
          <option value="">None</option>
          <option value="REVISION">REVISION</option>
          <option value="DEDUCTION">DEDUCTION</option>
          <option value="INTERSECTION">INTERSECTION</option>
          <option value="UNION">UNION</option>
        </select>
      </div>
    </div>
  );
};