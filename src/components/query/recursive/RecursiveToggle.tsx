import React from 'react';

interface RecursiveToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const RecursiveToggle: React.FC<RecursiveToggleProps> = ({
  label,
  description,
  checked,
  onChange
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id={`toggle-${label.toLowerCase()}`}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="rounded"
        />
        <label htmlFor={`toggle-${label.toLowerCase()}`} className="text-sm">{label}</label>
      </div>
      <p className="text-xs text-gray-500 ml-5">{description}</p>
    </div>
  );
};