import React from 'react';
import { MemoryNode } from '../../../types/memory';
import { NodeMetrics } from './NodeMetrics';
import { ConnectionList } from './ConnectionList';
import { ContentEditor } from './ContentEditor';
import { NodeHeader } from './NodeHeader';
import { useMemoryStore } from '../../../store/memoryStore';

interface NodeDetailsProps {
  node: MemoryNode;
}

export const NodeDetails: React.FC<NodeDetailsProps> = ({ node }) => {
  const updateNode = useMemoryStore((state) => state.updateNode);
  const removeConnection = useMemoryStore((state) => state.removeConnection);

  const handleRemoveConnection = (targetId: string) => {
    removeConnection(node.id, targetId);
  };

  return (
    <div className="p-4 space-y-4 bg-gray-900 rounded-lg border border-gray-700">
      <NodeHeader node={node} />
      <ContentEditor
        content={node.content}
        onChange={(content) => updateNode(node.id, { content })}
      />
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