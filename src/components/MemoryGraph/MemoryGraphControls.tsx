import React from 'react';
import { Plus } from 'lucide-react';
import { useMemoryStore } from '../../store/memoryStore';
import { MemoryType } from '../../types/memory';
import { MEMORY_TYPES } from '../../constants/memoryTypes';

export const MemoryGraphControls: React.FC = () => {
  const addNode = useMemoryStore((state) => state.addNode);

  const handleAddNode = (type: MemoryType) => {
    addNode({
      type,
      content: '',
      connections: [],
      strength: 1,
      depth: 0,
      energy: Math.random() * 100,
      resonance: Math.random() * 100,
    });
  };

  return (
    <div className="p-4 border-b border-gray-700">
      <h2 className="text-lg font-semibold mb-4 text-white">Add Memory Node</h2>
      <div className="grid grid-cols-1 gap-2">
        {MEMORY_TYPES.map(({ type, label, color }) => (
          <button
            key={type}
            onClick={() => handleAddNode(type)}
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