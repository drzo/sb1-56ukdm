import { useState } from 'react';
import NamespaceHierarchy from '../components/namespaces/NamespaceHierarchy';
import NamespaceDetails from '../components/namespaces/NamespaceDetails';
import NamespaceSearch from '../components/namespaces/NamespaceSearch';
import { useNamespaces } from '../hooks/useNamespaces';
import type { Namespace } from '../types/namespaces';

export default function NameSpace() {
  const [selectedNamespace, setSelectedNamespace] = useState<Namespace | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { data: namespaces, isLoading } = useNamespaces();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold dark:text-white">
              Plan 9 Namespace
            </h1>
            <NamespaceSearch 
              onSearch={setSearchQuery}
              placeholder="Search namespaces..."
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Namespace Hierarchy */}
            <div className="h-[800px] bg-gray-50 dark:bg-gray-900 rounded-lg p-4 overflow-auto">
              <NamespaceHierarchy
                data={namespaces}
                onSelect={setSelectedNamespace}
                searchQuery={searchQuery}
              />
            </div>

            {/* Right: Namespace Details */}
            <div className="h-[800px] bg-gray-50 dark:bg-gray-900 rounded-lg p-6 overflow-auto">
              {selectedNamespace ? (
                <NamespaceDetails namespace={selectedNamespace} />
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400">
                  Select a namespace to view details
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}