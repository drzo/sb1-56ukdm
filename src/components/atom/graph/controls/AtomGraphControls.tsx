import React from 'react';
import { GraphLayout } from '../renderer/types';

interface AtomGraphControlsProps {
  onLayoutChange: (layout: GraphLayout) => void;
  onLabelsToggle: () => void;
  onResetView: () => void;
  showLabels: boolean;
  currentLayout: GraphLayout;
}

export const AtomGraphControls: React.FC<AtomGraphControlsProps> = ({
  onLayoutChange,
  onLabelsToggle,
  onResetView,
  showLabels,
  currentLayout
}) => {
  return (
    <div className="flex gap-2">
      <button
        onClick={onResetView}
        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Reset View
      </button>
      <button
        onClick={onLabelsToggle}
        className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
      >
        {showLabels ? 'Hide Labels' : 'Show Labels'}
      </button>
      <select
        value={currentLayout}
        onChange={(e) => onLayoutChange(e.target.value as GraphLayout)}
        className="border rounded px-2"
      >
        <option value="force">Force Layout</option>
        <option value="tree">Tree Layout</option>
        <option value="radial">Radial Layout</option>
      </select>
    </div>
  );
};