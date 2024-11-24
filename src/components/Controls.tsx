import React from 'react';
import { Search, Filter, RefreshCw } from 'lucide-react';
import { useStore } from '../store';

export default function Controls() {
  const { setFilter, filter, refreshData } = useStore();

  return (
    <div className="p-4 border-b border-gray-200 flex items-center space-x-4">
      <div className="flex-1 flex items-center space-x-2">
        <Search className="w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search atoms..."
          className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          value={filter.search}
          onChange={(e) => setFilter({ ...filter, search: e.target.value })}
        />
      </div>
      
      <select 
        className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
        value={filter.type}
        onChange={(e) => setFilter({ ...filter, type: e.target.value })}
      >
        <option value="">All types</option>
        <option value="ConceptNode">Concepts</option>
        <option value="PredicateNode">Predicates</option>
        <option value="EvaluationLink">Evaluations</option>
      </select>

      <button
        onClick={refreshData}
        className="p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
      >
        <RefreshCw className="w-4 h-4" />
      </button>
    </div>
  );
}