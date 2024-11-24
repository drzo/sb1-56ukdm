import React from 'react';
import { Link, X } from 'lucide-react';
import { useMemoryStore } from '../store/memoryStore';
import { CONNECTION_TYPES } from '../constants/connectionTypes';

export const ConnectionControls: React.FC = () => {
  const selectedNode = useMemoryStore((state) => state.selectedNode);
  const connectionMode = useMemoryStore((state) => state.connectionMode);
  const startConnection = useMemoryStore((state) => state.startConnection);
  const cancelConnection = useMemoryStore((state) => state.cancelConnection);

  if (!selectedNode) return null;

  if (connectionMode.active) {
    const connectionType = CONNECTION_TYPES.find(t => t.type === connectionMode.type);
    return (
      <div className="bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${connectionType?.color}`} />
            <span className="text-white text-sm">{connectionType?.label}</span>
          </div>
          <button
            onClick={cancelConnection}
            className="p-1 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-gray-400 text-sm">Click any node to create connection</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">Create Connection</h3>
      <div className="grid grid-cols-1 gap-2">
        {CONNECTION_TYPES.map(({ type, label, color }) => (
          <button
            key={type}
            onClick={() => startConnection(selectedNode, type)}
            className={`flex items-center justify-center px-3 py-2 ${color} text-white rounded-lg hover:opacity-90 transition-opacity`}
          >
            <Link className="w-4 h-4 mr-2" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};