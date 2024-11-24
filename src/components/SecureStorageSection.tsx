import React from 'react';
import { Lock } from 'lucide-react';

export default function SecureStorageSection() {
  return (
    <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Lock className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Secure Storage</h2>
        </div>
        <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800">
          Add Secret
        </button>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">API Keys</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Secure storage for API credentials</p>
          </div>
          <span className="px-2.5 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
            Encrypted
          </span>
        </div>
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Personal Notes</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Private thoughts and observations</p>
          </div>
          <span className="px-2.5 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
            Protected
          </span>
        </div>
      </div>
    </div>
  );
}