import React from 'react';
import { MemoryNode } from '../../../types/memory';
import { MEMORY_TYPES_CONFIG } from '../../../constants/memoryTypes';

interface NodeHeaderProps {
  node: MemoryNode;
}

export const NodeHeader: React.FC<NodeHeaderProps> = ({ node }) => {
  const config = MEMORY_TYPES_CONFIG[node.type];

  return (
    <div className="flex items-center space-x-2">
      <div
        className="w-4 h-4 rounded-full"
        style={{ backgroundColor: config.color }}
      />
      <h3 className="text-lg font-semibold text-white">{config.label}</h3>
    </div>
  );
};