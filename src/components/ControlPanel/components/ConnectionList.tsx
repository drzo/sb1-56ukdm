import React from 'react';
import { Link } from 'lucide-react';
import { Connection } from '../../../types/memory';
import { CONNECTION_TYPES } from '../../../constants/connectionTypes';

interface ConnectionListProps {
  connections: Connection[];
  onRemoveConnection: (targetId: string) => void;
}

export const ConnectionList: React.FC<ConnectionListProps> = ({
  connections,
  onRemoveConnection,
}) => {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-300">Connections</h3>
      <div className="space-y-2">
        {connections.map((conn) => (
          <div
            key={conn.targetId}
            className="flex items-center justify-between p-2 bg-gray-900 rounded-lg"
          >
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  CONNECTION_TYPES.find((t) => t.type === conn.type)?.color
                }`}
              />
              <span className="text-sm text-white">{conn.targetId}</span>
            </div>
            <button
              onClick={() => onRemoveConnection(conn.targetId)}
              className="text-gray-400 hover:text-red-400 transition-colors"
            >
              <Link className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};