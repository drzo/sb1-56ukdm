import React from 'react';

interface TruthValueBarProps {
  value: number;
  label: string;
  color: 'blue' | 'green';
}

export const TruthValueBar: React.FC<TruthValueBarProps> = ({ value, label, color }) => {
  const percentage = (value: number) => `${(value * 100).toFixed(1)}%`;
  const colorClass = color === 'blue' ? 'bg-blue-600' : 'bg-green-600';

  return (
    <div>
      <span className="text-gray-600">{label}:</span>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`${colorClass} h-2.5 rounded-full transition-all duration-300`}
          style={{ width: percentage(value) }}
        />
      </div>
      <span className="text-xs">{percentage(value)}</span>
    </div>
  );
};