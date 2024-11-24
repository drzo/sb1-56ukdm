import React from 'react';
import { Pattern, AtomType, LogicalOperator, TruthValueOperator } from '../../lib/types';

interface PatternFormProps {
  pattern: Pattern;
  onChange: (pattern: Pattern) => void;
  onRemove: () => void;
}

export const PatternForm: React.FC<PatternFormProps> = ({ pattern, onChange, onRemove }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm space-y-3">
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
        <select
          value={pattern.type || ''}
          onChange={(e) => onChange({ ...pattern, type: e.target.value as AtomType })}
          className="border rounded p-2"
        >
          <option value="">Select Type</option>
          <option value="ConceptNode">ConceptNode</option>
          <option value="PredicateNode">PredicateNode</option>
          <option value="ListLink">ListLink</option>
          <option value="EvaluationLink">EvaluationLink</option>
          <option value="VariableNode">VariableNode</option>
        </select>

        <input
          type="text"
          placeholder="Name"
          value={pattern.name || ''}
          onChange={(e) => onChange({ ...pattern, name: e.target.value })}
          className="border rounded p-2"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={pattern.isVariable || false}
          onChange={(e) => onChange({ ...pattern, isVariable: e.target.checked })}
          className="rounded"
        />
        <label className="text-sm">Is Variable</label>
        {pattern.isVariable && (
          <input
            type="text"
            placeholder="Variable Name"
            value={pattern.variableName || ''}
            onChange={(e) => onChange({ ...pattern, variableName: e.target.value })}
            className="border rounded p-2 ml-2 flex-1"
          />
        )}
      </div>
    </div>
  );
};