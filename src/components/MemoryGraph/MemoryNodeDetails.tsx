import React from 'react';
import { Clock, Zap, Activity, Trash2 } from 'lucide-react';
import { useMemoryStore } from '../../store/memoryStore';
import { MemoryNode } from '../../types/memory';
import { MEMORY_TYPES_CONFIG } from '../../constants/memoryTypes';

interface MemoryNodeDetailsProps {
  node: MemoryNode;
}

export const MemoryNodeDetails: React.FC<MemoryNodeDetailsProps> = ({ node }) => {
  const updateNode = useMemoryStore((state) => state.updateNode);
  const removeNode = useMemoryStore((state) => state.removeNode);
  const config = MEMORY_TYPES_CONFIG[node.type];

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div
            className="w-4 h-4 rounded-full"
            style={{ background: config.color }}
          />
          <h3 className="text-lg font-semibold text-white">
            {config.label}
          </h3>
        </div>
        <button
          onClick={() => removeNode(node.id)}
          className="p-2 text-red-400 hover:text-red-300 transition-colors"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">Content</label>
        <textarea
          value={node.content}
          onChange={(e) => updateNode(node.id, { content: e.target.value })}
          className="w-full h-32 px-3 py-2 bg-gray-900 border border-gray-700 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white text-sm"
          placeholder="Enter memory content..."
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col items-center p-3 bg-gray-900 rounded-lg">
          <Clock className="w-5 h-5 text-blue-400 mb-1" />
          <span className="text-xs text-gray-400">Created</span>
          <span className="text-sm text-white">{new Date(node.timestamp).toLocaleDateString()}</span>
        </div>
        
        <div className="flex flex-col items-center p-3 bg-gray-900 rounded-lg">
          <Zap className="w-5 h-5 text-yellow-400 mb-1" />
          <span className="text-xs text-gray-400">Energy</span>
          <span className="text-sm text-white">{node.energy.toFixed(1)}</span>
        </div>

        <div className="flex flex-col items-center p-3 bg-gray-900 rounded-lg">
          <Activity className="w-5 h-5 text-green-400 mb-1" />
          <span className="text-xs text-gray-400">Resonance</span>
          <span className="text-sm text-white">{node.resonance.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
};