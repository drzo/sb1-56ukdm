import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import PatternHierarchy from '../components/patterns/PatternHierarchy';
import PatternDetails from '../components/patterns/PatternDetails';
import PatternSearch from '../components/patterns/PatternSearch';
import { patterns } from '../patterns';
import type { Pattern } from '../types/patterns';

export default function PatternSpace() {
  const [selectedPattern, setSelectedPattern] = useState<Pattern | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold dark:text-white">
              Pattern Language
            </h1>
            <PatternSearch 
              onSearch={setSearchQuery}
              placeholder="Search patterns..."
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Pattern Hierarchy */}
            <div className="h-[800px] bg-gray-50 dark:bg-gray-900 rounded-lg p-4 overflow-auto">
              <PatternHierarchy
                data={patterns}
                onSelect={setSelectedPattern}
                searchQuery={searchQuery}
              />
            </div>

            {/* Right: Pattern Details */}
            <div className="h-[800px] bg-gray-50 dark:bg-gray-900 rounded-lg p-6 overflow-auto">
              {selectedPattern ? (
                <PatternDetails pattern={selectedPattern} />
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400">
                  Select a pattern to view details
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}