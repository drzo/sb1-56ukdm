import React from 'react';

interface TemplateNameInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const TemplateNameInput: React.FC<TemplateNameInputProps> = ({ value, onChange }) => {
  return (
    <input
      type="text"
      placeholder="Template Name"
      className="w-full border rounded p-2"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required
    />
  );
};