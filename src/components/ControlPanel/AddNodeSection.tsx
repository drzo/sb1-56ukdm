import React from 'react';
import { Plus } from 'lucide-react';
import { MEMORY_TYPES } from '../../constants/memoryTypes';
import { MemoryType } from '../../types/memory';

interface AddNodeSectionProps {
  onAddNode: (type: MemoryType) => void;
}

export const AddNodeSection: React.FC<AddNodeSectionProps> = ({ onAddNode }) => {
  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow-xl border border-gray-700">
      <h2 className="text-lg font-semibold mb-4 text-white">Add Memory Node</h2>
      <div className="grid grid-cols-1 gap-2">
        {MEMORY_TYPES.map(({ type, label, color }) => (
          <button
            key={type}
            onClick={() => onAddNode(type)}
            className={`flex items-center justify-center px-4 py-2 text-white rounded-lg transition-colors ${color}`}
          >
            <Plus className="w-4 h-4 mr-2" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};