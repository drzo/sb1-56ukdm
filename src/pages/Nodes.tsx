import React, { useState } from 'react';
import { useNetworkStore } from '../store/networkStore';
import { PlusIcon } from '@heroicons/react/24/outline';

export function Nodes() {
  const { nodes, addNode, updateNodeStatus } = useNetworkStore();
  const [newNodeId, setNewNodeId] = useState('');

  const handleAddNode = () => {
    if (newNodeId) {
      addNode({
        id: newNodeId,
        status: 'active',
        connections: 1,
        storage: 100,
      });
      setNewNodeId('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Nodes</h1>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newNodeId}
            onChange={(e) => setNewNodeId(e.target.value)}
            placeholder="Node ID"
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          <button
            onClick={handleAddNode}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Node
          </button>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {nodes.map((node) => (
            <li key={node.id}>
              <div className="px-4 py-4 flex items-center justify-between sm:px-6">
                <div className="flex items-center">
                  <div
                    className={`h-3 w-3 rounded-full ${
                      node.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  />
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">{node.id}</h3>
                    <p className="text-sm text-gray-500">
                      Connections: {node.connections} | Storage: {node.storage} MB
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() =>
                      updateNodeStatus(
                        node.id,
                        node.status === 'active' ? 'inactive' : 'active'
                      )
                    }
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      node.status === 'active'
                        ? 'text-red-700 bg-red-100 hover:bg-red-200'
                        : 'text-green-700 bg-green-100 hover:bg-green-200'
                    }`}
                  >
                    {node.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}