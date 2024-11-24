import React from 'react';
import { Pattern } from '../../../../lib/types';
import { PatternTypeSelector } from './PatternTypeSelector';
import { PatternNameInput } from './PatternNameInput';
import { PatternVariableInput } from './PatternVariableInput';
import { PatternOutgoingLinks } from './PatternOutgoingLinks';
import { PatternRecursiveToggle } from './PatternRecursiveToggle';

interface PatternFormProps {
  pattern: Pattern;
  onChange: (pattern: Pattern) => void;
  onRemove: () => void;
}

export const PatternForm: React.FC<PatternFormProps> = ({ pattern, onChange, onRemove }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
      <div className="flex justify-between">
        <h4 className="font-medium">Pattern</h4>
        <button
          onClick={onRemove}
          className="text-red-500 hover:text-red-600"
        >
          Remove
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <PatternTypeSelector
          value={pattern.type}
          onChange={(type) => onChange({ ...pattern, type })}
        />
        <PatternNameInput
          value={pattern.name}
          onChange={(name) => onChange({ ...pattern, name })}
        />
      </div>

      <PatternVariableInput
        isVariable={pattern.isVariable || false}
        variableName={pattern.variableName}
        onIsVariableChange={(isVariable) => onChange({ ...pattern, isVariable })}
        onVariableNameChange={(variableName) => onChange({ ...pattern, variableName })}
      />

      <PatternOutgoingLinks
        outgoing={pattern.outgoing}
        onChange={(outgoing) => onChange({ ...pattern, outgoing })}
      />

      <PatternRecursiveToggle
        recursive={pattern.recursive}
        onChange={(recursive) => onChange({ ...pattern, recursive })}
      />
    </div>
  );
};