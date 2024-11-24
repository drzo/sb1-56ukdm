import React from 'react';

interface TemplateDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const TemplateDescriptionInput: React.FC<TemplateDescriptionInputProps> = ({ value, onChange }) => {
  return (
    <textarea
      placeholder="Description (optional)"
      className="w-full border rounded p-2"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};