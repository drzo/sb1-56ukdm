import React from 'react';

interface PatternNameInputProps {
  value: string | undefined;
  onChange: (name: string) => void;
}

export const PatternNameInput: React.FC<PatternNameInputProps> = ({ value, onChange }) => {
  return (
    <input
      type="text"
      placeholder="Pattern Name"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className="border rounded p-2 w-full"
    />
  );
};