import React from 'react';

interface IntegrationCardProps {
  icon: React.ReactNode;
  name: string;
  description: string;
  status: 'connected' | 'disconnected';
}

export default function IntegrationCard({ icon, name, description, status }: IntegrationCardProps) {
  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-center gap-4">
        <div className="text-indigo-600 dark:text-indigo-400">
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            {name}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {description}
          </p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span
          className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
            status === 'connected'
              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
          }`}
        >
          {status}
        </span>
        <button className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">
          {status === 'connected' ? 'Configure' : 'Connect'}
        </button>
      </div>
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-indigo-500 dark:group-hover:border-indigo-400 rounded-lg transition-colors duration-200" />
    </div>
  );
}