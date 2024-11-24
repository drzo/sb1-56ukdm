import React from 'react';
import { AtomType } from '../../../../lib/types';

interface PatternTypeSelectorProps {
  value: AtomType | undefined;
  onChange: (type: AtomType) => void;
}

export const PatternTypeSelector: React.FC<PatternTypeSelectorProps> = ({ value, onChange }) => {
  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value as AtomType)}
      className="border rounded p-2 w-full"
    >
      <option value="">Select Type</option>
      <option value="ConceptNode">ConceptNode</option>
      <option value="PredicateNode">PredicateNode</option>
      <option value="ListLink">ListLink</option>
      <option value="EvaluationLink">EvaluationLink</option>
      <option value="VariableNode">VariableNode</option>
    </select>
  );
};