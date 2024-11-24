import React, { useState, useEffect } from 'react';
import { useAssistantStore } from '../store/assistantStore';
import { fetchAssistants } from '../lib/openai';
import { Bot, RefreshCw, AlertCircle } from 'lucide-react';

interface AssistantSelectorProps {
  characterId: string;
  onSelect: (assistantId: string) => void;
}

export default function AssistantSelector({ characterId, onSelect }: AssistantSelectorProps) {
  const { assistants, mappings, addMapping, getAssistantForCharacter, setAssistants } = useAssistantStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  const currentAssistant = getAssistantForCharacter(characterId);

  useEffect(() => {
    loadAssistants();
  }, []);

  const loadAssistants = async () => {
    try {
      setLoading(true);
      setError(null);
      const assistantsList = await fetchAssistants();
      setAssistants(assistantsList);
    } catch (err) {
      setError('Failed to load assistants. Please ensure your API key is set.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (assistantId: string) => {
    addMapping({ characterId, assistantId });
    onSelect(assistantId);
  };

  const syncAssistants = async () => {
    setSyncing(true);
    setError(null);
    try {
      const assistantsList = await fetchAssistants();
      setAssistants(assistantsList);
    } catch (err) {
      setError('Failed to sync assistants. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          OpenAI Assistant
        </h3>
        <button
          onClick={syncAssistants}
          disabled={syncing}
          className="flex items-center gap-2 px-3 py-1 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          Sync
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/50 rounded-lg flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {assistants.length === 0 ? (
        <div className="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Bot className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-300 mb-4">No assistants found</p>
          <a 
            href="https://platform.openai.com/assistants" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
          >
            Create an assistant in OpenAI
          </a>
        </div>
      ) : (
        <div className="space-y-2">
          {assistants.map((assistant) => (
            <button
              key={assistant.id}
              onClick={() => handleSelect(assistant.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border ${
                currentAssistant?.id === assistant.id
                  ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/50'
                  : 'border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-400'
              }`}
            >
              <Bot className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <div className="flex-1 text-left">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {assistant.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {assistant.model}
                </div>
              </div>
              {assistant.lastSync && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Last synced: {new Date(assistant.lastSync).toLocaleDateString()}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}