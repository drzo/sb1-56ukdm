import React from 'react';
import Header from '../components/Header';
import { Database, Clock, Tag, BarChart2 } from 'lucide-react';

interface MemoryStoreProps {
  isDark: boolean;
  setIsDark: (isDark: boolean) => void;
}

export default function MemoryStore({ isDark, setIsDark }: MemoryStoreProps) {
  const memoryTypes = [
    {
      icon: <Database className="w-5 h-5" />,
      name: 'Semantic Memory',
      size: '2.4 GB',
      entries: '145,678',
      status: 'Optimized',
    },
    {
      icon: <Clock className="w-5 h-5" />,
      name: 'Episodic Memory',
      size: '1.8 GB',
      entries: '89,432',
      status: 'Active',
    },
    {
      icon: <Tag className="w-5 h-5" />,
      name: 'Procedural Memory',
      size: '956 MB',
      entries: '34,567',
      status: 'Learning',
    },
    {
      icon: <BarChart2 className="w-5 h-5" />,
      name: 'Working Memory',
      size: '512 MB',
      entries: '1,234',
      status: 'Active',
    },
  ];

  return (
    <main className="flex-1 flex flex-col">
      <Header title="Memory Store" isDark={isDark} setIsDark={setIsDark} />
      
      <div className="flex-1 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {memoryTypes.map((memory) => (
            <div key={memory.name} className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-indigo-600 dark:text-indigo-400">{memory.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{memory.name}</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Size</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{memory.size}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Entries</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{memory.entries}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Status</span>
                  <span className="px-2 py-1 text-xs font-medium text-green-800 dark:text-green-200 bg-green-100 dark:bg-green-900 rounded-full">
                    {memory.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Memory Analysis */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Memory Usage Trends</h3>
            <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <span className="text-gray-500 dark:text-gray-400">Usage trends visualization coming soon...</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Memory Distribution</h3>
            <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <span className="text-gray-500 dark:text-gray-400">Distribution chart coming soon...</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}