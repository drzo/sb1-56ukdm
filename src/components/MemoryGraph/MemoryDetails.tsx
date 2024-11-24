import React from 'react';
import { Clock, Zap, Activity } from 'lucide-react';
import { useMemoryStore } from '../../store/memoryStore';
import { typeConfig } from './config';

interface MemoryDetailsProps {
  nodeId: string;
}

export const MemoryDetails: React.FC<MemoryDetailsProps> = ({ nodeId }) => {
  const node = useMemoryStore((state) => 
    state.nodes.find((n) => n.id === nodeId)
  );
  const updateNode = useMemoryStore((state) => state.updateNode);

  if (!node) return null;

  return (
    <div className="p-4 space-y-4 bg-gray-900 text-white h-full">
      <div className="flex items-center space-x-2">
        <div
          className="w-4 h-4 rounded-full"
          style={{ background: typeConfig[node.type].gradient }}
        />
        <h3 className="text-lg font-semibold">
          {typeConfig[node.type].label}
        </h3>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">Essence</label>
        <textarea
          value={node.content}
          onChange={(e) => updateNode(node.id, { content: e.target.value })}
          className="w-full h-32 px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
          placeholder="Enter the alchemical essence..."
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col items-center p-3 bg-gray-800 rounded-lg">
          <Clock className="w-5 h-5 text-blue-400 mb-1" />
          <span className="text-xs text-gray-400">Cycle</span>
          <span className="text-sm">{new Date(node.timestamp).toLocaleDateString()}</span>
        </div>
        
        <div className="flex flex-col items-center p-3 bg-gray-800 rounded-lg">
          <Zap className="w-5 h-5 text-yellow-400 mb-1" />
          <span className="text-xs text-gray-400">Energy</span>
          <span className="text-sm">{node.energy || 0}</span>
        </div>

        <div className="flex flex-col items-center p-3 bg-gray-800 rounded-lg">
          <Activity className="w-5 h-5 text-green-400 mb-1" />
          <span className="text-xs text-gray-400">Resonance</span>
          <span className="text-sm">{node.resonance || 0}</span>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-300">Connections</h4>
        <div className="space-y-1">
          {node.connections.map((connectionId) => (
            <div
              key={connectionId}
              className="text-sm bg-gray-800 px-3 py-2 rounded-md"
            >
              {connectionId}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};