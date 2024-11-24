import React from 'react';
import { MemoryNode } from '../types/memory';
import { NodeMetrics } from './ControlPanel/components/NodeMetrics';
import { ConnectionList } from './ControlPanel/components/ConnectionList';
import { useMemoryStore } from '../store/memoryStore';
import { MEMORY_TYPES_CONFIG } from '../constants/memoryTypes';

interface MemoryNodeDetailsProps {
  node: MemoryNode;
}

export const MemoryNodeDetails: React.FC<MemoryNodeDetailsProps> = ({ node }) => {
  const updateNode = useMemoryStore((state) => state.updateNode);
  const removeConnection = useMemoryStore((state) => state.removeConnection);
  const config = MEMORY_TYPES_CONFIG[node.type];

  const handleRemoveConnection = (targetId: string) => {
    removeConnection(node.id, targetId);
  };

  return (
    <div className="p-4 space-y-4 bg-gray-900 rounded-lg border border-gray-700">
      <div className="flex items-center space-x-2">
        <div
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: config.color }}
        />
        <h3 className="text-lg font-semibold text-white">{config.label}</h3>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">Content</label>
        <textarea
          value={node.content}
          onChange={(e) => updateNode(node.id, { content: e.target.value })}
          className="w-full h-32 px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white text-sm resize-none"
          placeholder="Enter memory content..."
        />
      </div>

      <NodeMetrics
        timestamp={node.timestamp}
        energy={node.energy}
        resonance={node.resonance}
      />

      <ConnectionList
        connections={node.connections}
        onRemoveConnection={handleRemoveConnection}
      />
    </div>
  );
};