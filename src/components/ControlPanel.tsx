import React from 'react';
import { useMemoryStore } from '../store/memoryStore';
import { Plus, Trash2 } from 'lucide-react';
import { MemoryType } from '../types/memory';
import { MEMORY_TYPES } from '../constants/memoryTypes';
import { ConnectionControls } from './ConnectionControls';
import { MemoryNodeDetails } from './MemoryNodeDetails';

export const ControlPanel: React.FC = () => {
  const addNode = useMemoryStore((state) => state.addNode);
  const selectedNode = useMemoryStore((state) => state.selectedNode);
  const nodes = useMemoryStore((state) => state.nodes);
  const removeNode = useMemoryStore((state) => state.removeNode);

  const handleAddNode = (type: MemoryType) => {
    addNode({
      type,
      content: `New ${type} memory`,
      connections: [],
      strength: 1,
      depth: 0,
      energy: Math.random() * 100,
      resonance: Math.random() * 100,
    });
  };

  const selectedNodeData = nodes.find(node => node.id === selectedNode);

  return (
    <div className="p-4 space-y-4">
      <div className="bg-gray-900 p-4 rounded-lg shadow-xl border border-gray-700">
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

      {selectedNode && (
        <>
          <ConnectionControls />
          {selectedNodeData && <MemoryNodeDetails node={selectedNodeData} />}
          <div className="bg-gray-900 p-4 rounded-lg shadow-xl border border-gray-700">
            <button
              onClick={() => removeNode(selectedNode)}
              className="flex items-center justify-center w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remove Node
            </button>
          </div>
        </>
      )}
    </div>
  );
};