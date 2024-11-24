import React from 'react';

interface TruthValueLabelProps {
  label: string;
}

export const TruthValueLabel: React.FC<TruthValueLabelProps> = ({ label }) => {
  return <div className="font-semibold mb-1">{label}</div>;
};