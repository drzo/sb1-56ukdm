import React from 'react';

interface RecursiveDepthControlProps {
  value: number;
  onChange: (value: number) => void;
}

export const RecursiveDepthControl: React.FC<RecursiveDepthControlProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">Max Depth</label>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min="1"
          max="10"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full"
        />
        <span className="text-sm w-8">{value}</span>
      </div>
      <p className="text-xs text-gray-500">Maximum depth for recursive pattern matching</p>
    </div>
  );
};