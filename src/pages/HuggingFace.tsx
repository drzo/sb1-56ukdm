import React, { useState } from 'react';
import Header from '../components/Header';
import { RefreshCw, Plus, Cpu, CircuitBoard, Scale, Download, AlertCircle } from 'lucide-react';

interface HuggingFaceProps {
  isDark: boolean;
  setIsDark: (isDark: boolean) => void;
}

interface Model {
  id: string;
  name: string;
  type: string;
  parameters: string;
  architecture: string;
  license: string;
  lastUpdated: string;
  downloads: number;
  status: 'available' | 'syncing' | 'error';
}

export default function HuggingFace({ isDark, setIsDark }: HuggingFaceProps) {
  const [syncing, setSyncing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sample models data
  const models: Model[] = [
    {
      id: 'mistralai/Mistral-7B-v0.1',
      name: 'Mistral-7B',
      type: 'Language Model',
      parameters: '7B',
      architecture: 'Transformer',
      license: 'Apache 2.0',
      lastUpdated: '2024-03-15',
      downloads: 1250000,
      status: 'available'
    },
    {
      id: 'meta-llama/Llama-2-7b',
      name: 'Llama-2-7b',
      type: 'Language Model',
      parameters: '7B',
      architecture: 'Transformer',
      license: 'LLAMA 2',
      lastUpdated: '2024-03-14',
      downloads: 2500000,
      status: 'available'
    },
    {
      id: 'stabilityai/stable-diffusion-xl-base-1.0',
      name: 'Stable Diffusion XL',
      type: 'Image Generation',
      parameters: '2.3B',
      architecture: 'Diffusion',
      license: 'CreativeML Open RAIL-M',
      lastUpdated: '2024-03-13',
      downloads: 3750000,
      status: 'available'
    }
  ];

  const handleSync = async () => {
    setSyncing(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Handle sync logic here
    } catch (err) {
      setError('Failed to sync models. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <main className="flex-1 flex flex-col">
      <Header title="Hugging Face Models" isDark={isDark} setIsDark={setIsDark} />
      
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleSync}
                disabled={syncing}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
                Sync Models
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <Plus className="w-5 h-5" />
                Create LLM
              </button>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search models..."
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/50 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          {/* Models Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {models.map((model) => (
              <div
                key={model.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {model.name}
                  </h3>
                  <span className="px-2.5 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                    {model.status}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Cpu className="w-4 h-4" />
                    <span>{model.architecture}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <CircuitBoard className="w-4 h-4" />
                    <span>{model.parameters} parameters</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Scale className="w-4 h-4" />
                    <span>{model.license}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Download className="w-4 h-4" />
                    <span>{formatNumber(model.downloads)} downloads</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Updated: {new Date(model.lastUpdated).toLocaleDateString()}
                  </span>
                  <button className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create LLM Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Create Custom LLM
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Base Model
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option>Mistral-7B</option>
                  <option>Llama-2-7b</option>
                  <option>GPT-2</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Knowledge Corpus
                </label>
                <input
                  type="file"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  accept=".txt,.pdf,.doc,.docx"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Training Parameters
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={4}
                  placeholder="Enter training parameters in JSON format"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Cancel
              </button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                Create LLM
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}