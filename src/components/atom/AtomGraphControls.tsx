import React from 'react';

export const AtomGraphControls: React.FC = () => {
  return (
    <div className="flex gap-2">
      <button className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
        Reset View
      </button>
      <button className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600">
        Toggle Labels
      </button>
      <select className="border rounded px-2">
        <option value="force">Force Layout</option>
        <option value="tree">Tree Layout</option>
        <option value="radial">Radial Layout</option>
      </select>
    </div>
  );
};