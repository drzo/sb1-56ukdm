import React from 'react';
import { useSwarmStore } from '../../store/swarmStore';
import {
  ServerIcon,
  CpuChipIcon,
  CircleStackIcon,
} from '@heroicons/react/24/outline';

export function NodeList() {
  const { nodes, updateNodeStatus, removeNode } = useSwarmStore();

  return (
    <div className="space-y-4">
      {nodes.map((node) => (
        <div
          key={node.id}
          className="bg-white rounded-lg shadow p-4 space-y-4"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {node.hostname}
              </h3>
              <p className="text-sm text-gray-500">ID: {node.id}</p>
            </div>
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${
                node.status === 'ready'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {node.status}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <CpuChipIcon className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">CPU</p>
                <p className="text-sm text-gray-500">{node.cpu}%</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <ServerIcon className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Memory</p>
                <p className="text-sm text-gray-500">{node.memory}%</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <CircleStackIcon className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Disk</p>
                <p className="text-sm text-gray-500">{node.disk}%</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              onClick={() =>
                updateNodeStatus(node.id, node.status === 'ready' ? 'down' : 'ready')
              }
              className={`px-3 py-1 text-sm font-medium rounded-md ${
                node.status === 'ready'
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {node.status === 'ready' ? 'Drain' : 'Activate'}
            </button>
            <button
              onClick={() => removeNode(node.id)}
              className="px-3 py-1 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200"
            >
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}