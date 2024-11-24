import React from 'react';
import { LogicalOperator, TruthValueOperator } from '../../../lib/types';
import { LogicalOperatorSelect } from './LogicalOperatorSelect';
import { TruthValueOperatorSelect } from './TruthValueOperatorSelect';

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
    <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
      <h4 className="font-medium">Pattern Operators</h4>
      <div className="flex gap-4">
        <LogicalOperatorSelect
          value={logicalOperator}
          onChange={onLogicalOperatorChange}
        />
        <TruthValueOperatorSelect
          value={tvOperator}
          onChange={onTvOperatorChange}
        />
      </div>
    </div>
  );
};