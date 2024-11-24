import React from 'react';
import { useMemoryStore } from '../store/memoryStore';
import { INSTANCE_TYPES } from '../constants/instanceTypes';

export const InstanceSelector: React.FC = () => {
  const instances = useMemoryStore((state) => state.instances);
  const currentInstance = useMemoryStore((state) => state.currentInstance);
  const setCurrentInstance = useMemoryStore((state) => state.setCurrentInstance);

  return (
    <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
      <h3 className="text-sm font-medium text-gray-300 mb-2">Active Instance</h3>
      <select
        value={currentInstance.id}
        onChange={(e) => setCurrentInstance(e.target.value)}
        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
      >
        {instances.map((instance) => {
          const typeConfig = INSTANCE_TYPES.find(t => t.type === instance.type);
          return (
            <option key={instance.id} value={instance.id}>
              {typeConfig?.label} ({instance.platform})
            </option>
          );
        })}
      </select>
      <div className="mt-2 text-xs text-gray-400">
        Height Index: {currentInstance.height}
      </div>
    </div>
  );
};