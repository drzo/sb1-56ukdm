import React, { useState, useEffect } from 'react';
import { Brain, Database, GitBranch } from 'lucide-react';
import { useStore } from '../store';
import { MemorySystem, AssistantInstance } from '../types/memory';
import { getMemorySystems, getAssistantInstances } from '../utils/db';
import { retrieveAssistants } from '../api/openai';
import TokenModal from './TokenModal';

export default function MemoryView() {
  const [activeTab, setActiveTab] = useState<'systems' | 'instances' | 'mappings'>('systems');
  const [memorySystems, setMemorySystems] = useState<MemorySystem[]>([]);
  const [assistantInstances, setAssistantInstances] = useState<AssistantInstance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { openaiToken, setShowOpenAITokenModal } = useStore();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setIsLoading(true);
      setError(null);

      const [systems, instances] = await Promise.all([
        getMemorySystems(),
        getAssistantInstances()
      ]);
      
      setMemorySystems(systems || []);
      setAssistantInstances(instances || []);
    } catch (error) {
      console.error('Failed to load memory data:', error);
      setError('Failed to load memory systems and instances');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRetrieveAssistants() {
    if (!openaiToken) {
      setShowOpenAITokenModal(true);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const instances = await retrieveAssistants();
      if (instances && instances.length > 0) {
        setAssistantInstances(instances);
        setError(null);
      } else {
        setError('No assistants found or could not be saved');
      }
    } catch (error) {
      console.error('Failed to retrieve assistants:', error);
      let errorMessage = error instanceof Error ? error.message : 'Failed to retrieve assistants';
      
      if (errorMessage.includes('401') || errorMessage.includes('invalid_api_key')) {
        errorMessage = 'Invalid OpenAI API key. Please check your settings.';
        setShowOpenAITokenModal(true);
      } else if (errorMessage.includes('429')) {
        errorMessage = 'Rate limit exceeded. Please try again later.';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="h-full bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading memory systems...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white overflow-auto">
      <div className="border-b">
        <nav className="flex space-x-4 px-6">
          <button
            onClick={() => setActiveTab('systems')}
            className={`py-4 px-2 border-b-2 font-medium flex items-center ${
              activeTab === 'systems'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Database className="w-5 h-5 mr-2" />
            Memory Systems
          </button>
          <button
            onClick={() => setActiveTab('instances')}
            className={`py-4 px-2 border-b-2 font-medium flex items-center ${
              activeTab === 'instances'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Brain className="w-5 h-5 mr-2" />
            Assistant Instances
          </button>
          <button
            onClick={() => setActiveTab('mappings')}
            className={`py-4 px-2 border-b-2 font-medium flex items-center ${
              activeTab === 'mappings'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <GitBranch className="w-5 h-5 mr-2" />
            Function Mappings
          </button>
        </nav>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
            {error}
          </div>
        )}

        {activeTab === 'instances' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Assistant Instances</h3>
              <button
                onClick={handleRetrieveAssistants}
                disabled={isLoading}
                className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoading ? 'Retrieving...' : 'Retrieve Assistants'}
              </button>
            </div>

            {assistantInstances.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No assistant instances found.</p>
                <p className="text-sm mt-2">Click "Retrieve Assistants" to fetch available instances.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {assistantInstances.map((instance) => (
                  <div key={instance.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{instance.name}</h4>
                        <p className="text-sm text-gray-500">ID: {instance.assistantId}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        instance.type === 'production'
                          ? 'bg-green-100 text-green-800'
                          : instance.type === 'orchestrator'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {instance.type}
                      </span>
                    </div>
                    {instance.systemPrompt && (
                      <div className="mt-2">
                        <h5 className="text-sm font-medium text-gray-600">System Prompt:</h5>
                        <p className="text-sm mt-1">{instance.systemPrompt}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'systems' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Memory Systems</h3>
            {memorySystems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No memory systems available.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {memorySystems.map((system) => (
                  <div key={system.id} className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium">{system.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{system.description}</p>
                    <span className="mt-2 inline-block px-2 py-1 bg-gray-100 rounded text-sm">
                      {system.type}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'mappings' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Function Mappings</h3>
            <p className="text-gray-600">
              Configure which assistant instances handle specific memory functions.
            </p>
            <div className="text-center py-8 text-gray-500">
              <GitBranch className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Function mapping configuration coming soon.</p>
            </div>
          </div>
        )}
      </div>

      <TokenModal />
    </div>
  );
}