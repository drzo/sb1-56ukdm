import React from 'react';
import { useInstanceStore } from '../../store/instanceStore';
import { Brain, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

export const MessageFlow: React.FC = () => {
  const messages = useInstanceStore(state => state.messages);
  const instances = useInstanceStore(state => state.instances);

  const getInstanceLabel = (instanceId: string) => {
    const instance = instances.get(instanceId);
    return instance ? `${instance.type} (h=${instance.height})` : instanceId;
  };

  return (
    <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">Message Flow</h3>
      
      <div className="space-y-3">
        {messages.slice(-5).reverse().map(message => (
          <div
            key={message.id}
            className="p-3 bg-gray-800 rounded-lg space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Brain className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-white">
                  {getInstanceLabel(message.instanceId)}
                </span>
                {message.context?.memoryIds && (
                  <span className="text-xs text-gray-400">
                    ({message.context.memoryIds.length} memories)
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-400">
                {format(message.timestamp, 'HH:mm:ss')}
              </span>
            </div>
            
            <div className="text-sm text-gray-300">
              {message.content}
            </div>

            {message.context?.resonance && (
              <div className="flex items-center space-x-1 text-xs text-purple-400">
                <ArrowRight className="w-3 h-3" />
                <span>Resonance: {message.context.resonance.toFixed(2)}</span>
              </div>
            )}
          </div>
        ))}

        {messages.length === 0 && (
          <div className="text-center text-gray-400 py-4">
            No messages yet
          </div>
        )}
      </div>
    </div>
  );
};