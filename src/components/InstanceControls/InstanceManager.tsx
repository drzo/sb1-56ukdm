import React from 'react';
import { useAtomSpace } from '../../store/atomSpaceStore';
import { InstanceType } from '../../types/memory';
import { INSTANCE_TYPES } from '../../constants/instanceTypes';

export const InstanceManager: React.FC = () => {
  const instances = useAtomSpace(state => state.instances);
  const addInstance = useAtomSpace(state => state.addInstance);

  const handleAddInstance = (type: InstanceType, platform: string) => {
    addInstance({
      type,
      platform,
      height: instances.size + 1,
      created: Date.now()
    });
  };

  return (
    <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">Instances</h3>
      
      <div className="space-y-4">
        {Array.from(instances.values()).map(instance => (
          <div
            key={instance.id}
            className="p-3 bg-gray-800 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-white">
                  {INSTANCE_TYPES.find(t => t.type === instance.type)?.label}
                </div>
                <div className="text-xs text-gray-400">
                  Height: {instance.height}
                </div>
              </div>
              <div className="text-xs text-gray-400">
                {instance.platform}
              </div>
            </div>
          </div>
        ))}

        <div className="grid grid-cols-2 gap-2">
          {INSTANCE_TYPES.map(({ type, label, color }) => (
            <button
              key={type}
              onClick={() => handleAddInstance(type, 'default')}
              className={`px-3 py-2 rounded-lg text-white ${color}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};