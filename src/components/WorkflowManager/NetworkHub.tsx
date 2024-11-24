import React from 'react';
import { useWorkflowStore } from '../../store/workflowStore';
import { NetworkInteraction } from '../../types/workflow';
import { Globe, Github, MessageSquare } from 'lucide-react';

export const NetworkHub: React.FC = () => {
  const interactions = useWorkflowStore((state) => state.interactions);
  const interact = useWorkflowStore((state) => state.interact);

  const handleInteract = (platform: NetworkInteraction['platform']) => {
    interact({
      platform,
      type: 'discussion',
      participants: [],
      content: '',
    });
  };

  return (
    <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">Network Hub</h3>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <button
          onClick={() => handleInteract('singularitynet')}
          className="flex flex-col items-center p-3 bg-blue-500 rounded-lg text-white hover:bg-blue-600 transition-colors"
        >
          <Globe className="w-6 h-6 mb-1" />
          <span className="text-xs">SingularityNet</span>
        </button>

        <button
          onClick={() => handleInteract('github')}
          className="flex flex-col items-center p-3 bg-gray-700 rounded-lg text-white hover:bg-gray-600 transition-colors"
        >
          <Github className="w-6 h-6 mb-1" />
          <span className="text-xs">GitHub</span>
        </button>

        <button
          onClick={() => handleInteract('discord')}
          className="flex flex-col items-center p-3 bg-purple-500 rounded-lg text-white hover:bg-purple-600 transition-colors"
        >
          <MessageSquare className="w-6 h-6 mb-1" />
          <span className="text-xs">Discord</span>
        </button>
      </div>

      <div className="space-y-2">
        {interactions.slice(-5).map((interaction) => (
          <div
            key={interaction.id}
            className="p-3 bg-gray-800 rounded-lg"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-white">
                {interaction.platform}
              </span>
              <span className="text-xs text-gray-400">
                {new Date(interaction.timestamp).toLocaleString()}
              </span>
            </div>
            <div className="text-sm text-gray-300">
              {interaction.type}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};