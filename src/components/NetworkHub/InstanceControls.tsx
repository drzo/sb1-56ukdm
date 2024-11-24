import React from 'react';
import { useInstanceStore } from '../../store/instanceStore';
import { INSTANCE_TYPES } from '../../constants/instanceTypes';
import { Settings, Plus } from 'lucide-react';

export const InstanceControls: React.FC = () => {
  const instances = useInstanceStore(state => state.instances);
  const instanceStates = useInstanceStore(state => state.instanceStates);
  const addInstance = useInstanceStore(state => state.addInstance);
  const updateInstanceState = useInstanceStore(state => state.updateInstanceState);

  const handleAddInstance = (type: string, platform: string) => {
    addInstance({
      type: type as any,
      platform,
      height: instances.size,
      api: {
        type: platform as any,
        modelName: type === 'chatgpt' ? 'gpt-4' : undefined
      }
    });
  };

  const handleToggleInstance = (instanceId: string) => {
    const currentState = instanceStates.get(instanceId);
    if (currentState) {
      updateInstanceState(instanceId, {
        status: currentState.status === 'active' ? 'idle' : 'active'
      });
    }
  };

  return (
    <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Instances</h3>
        <button
          onClick={() => handleAddInstance('chatgpt', 'openai')}
          className="p-2 text-gray-400 hover:text-white transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-2">
        {Array.from(instances.values()).map(instance => {
          const state = instanceStates.get(instance.id);
          const typeConfig = INSTANCE_TYPES.find(t => t.type === instance.type);

          return (
            <div
              key={instance.id}
              className="p-3 bg-gray-800 rounded-lg flex items-center justify-between"
            >
              <div>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    state?.status === 'active' ? 'bg-green-400' : 'bg-gray-400'
                  }`} />
                  <span className="text-sm font-medium text-white">
                    {typeConfig?.label}
                  </span>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Height: {instance.height}
                </div>
              </div>

              <button
                onClick={() => handleToggleInstance(instance.id)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};