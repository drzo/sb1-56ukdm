import React from 'react';

interface PatternVariableInputProps {
  isVariable: boolean;
  variableName: string | undefined;
  onIsVariableChange: (isVariable: boolean) => void;
  onVariableNameChange: (name: string) => void;
}

export const PatternVariableInput: React.FC<PatternVariableInputProps> = ({
  isVariable,
  variableName,
  onIsVariableChange,
  onVariableNameChange,
}) => {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={isVariable}
          onChange={(e) => onIsVariableChange(e.target.checked)}
          className="rounded"
        />
        <label className="text-sm">Is Variable</label>
      </div>
      {isVariable && (
        <input
          type="text"
          placeholder="Variable Name"
          value={variableName || ''}
          onChange={(e) => onVariableNameChange(e.target.value)}
          className="border rounded p-2 flex-1"
        />
      )}
    </div>
  );
};