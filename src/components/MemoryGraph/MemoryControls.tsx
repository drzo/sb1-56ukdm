import React from 'react';
import { Plus } from 'lucide-react';
import { useMemoryStore } from '../../store/memoryStore';
import { MemoryType } from '../../types/memory';
import { typeConfig } from './config';

const memoryTypes: { type: MemoryType; label: string }[] = [
  { type: 'declarative', label: 'Prima Materia' },
  { type: 'procedural', label: 'Transmutation' },
  { type: 'episodic', label: 'Eternal Return' },
  { type: 'intentional', label: 'Philosopher\'s Stone' },
];

export const MemoryControls: React.FC = () => {
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
    <div className="p-4 border-b border-gray-200 bg-gray-900">
      <div className="grid grid-cols-2 gap-2">
        {memoryTypes.map(({ type, label }) => (
          <button
            key={type}
            onClick={() => handleAddNode(type)}
            className="flex items-center justify-center px-3 py-2 text-sm text-white rounded-lg transition-colors"
            style={{ backgroundColor: typeConfig[type].color }}
          >
            <Plus className="w-4 h-4 mr-1" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};