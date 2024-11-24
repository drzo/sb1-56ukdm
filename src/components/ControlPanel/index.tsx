import React from 'react';
import { useMemoryStore } from '../../store/memoryStore';
import { AddNodeSection } from './components/AddNodeSection';
import { ConnectionControls } from './components/ConnectionControls';
import { NodeDetails } from './components/NodeDetails';
import { InstanceManager } from '../InstanceControls/InstanceManager';

export const ControlPanel: React.FC = () => {
  const addNode = useMemoryStore((state) => state.addNode);
  const selectedNode = useMemoryStore((state) => state.selectedNode);
  const nodes = useMemoryStore((state) => state.nodes);
  const selectedNodeData = nodes.find(node => node.id === selectedNode);

  return (
    <div className="p-4 space-y-4">
      <InstanceManager />
      <AddNodeSection onAddNode={addNode} />
      {selectedNode && (
        <>
          <ConnectionControls />
          {selectedNodeData && <NodeDetails node={selectedNodeData} />}
        </>
      )}
    </div>
  );
};