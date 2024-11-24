import React, { useState } from 'react';
import { Send, Brain, RefreshCw } from 'lucide-react';
import { useInstanceStore } from '../../store/instanceStore';
import { NetworkMessage } from '../../types/instance';

interface InstanceChatProps {
  instanceId: string;
}

export const InstanceChat: React.FC<InstanceChatProps> = ({ instanceId }) => {
  const [message, setMessage] = useState('');
  const instance = useInstanceStore(state => state.instances.get(instanceId));
  const messages = useInstanceStore(state => state.getMessages(instanceId));
  const sendMessage = useInstanceStore(state => state.sendMessage);
  const instanceState = useInstanceStore(state => state.instanceStates.get(instanceId));

  if (!instance || !instanceState) return null;

  const handleSend = () => {
    if (!message.trim()) return;

    sendMessage({
      instanceId,
      content: message,
      type: 'thought',
      context: {
        height: instance.height,
        resonance: instanceState.metrics.resonance
      }
    });

    setMessage('');
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-lg border border-gray-700">
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Brain className="w-5 h-5 text-purple-400" />
          <span className="text-white font-medium">{instance.type}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">Height: {instance.height}</span>
          <div className={`w-2 h-2 rounded-full ${
            instanceState.status === 'active' ? 'bg-green-400' : 'bg-gray-400'
          }`} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg: NetworkMessage) => (
          <div
            key={msg.id}
            className={`p-3 rounded-lg ${
              msg.type === 'thought' ? 'bg-gray-800' : 'bg-purple-900'
            }`}
          >
            <div className="text-sm text-white">{msg.content}</div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-xs text-gray-400">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
              {msg.context?.resonance && (
                <span className="text-xs text-purple-400">
                  Resonance: {msg.context.resonance.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-gray-700">
        <div className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Share a thought..."
          />
          <button
            onClick={handleSend}
            className="p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};