import { useState, useEffect } from 'react';

interface PatternSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export default function PatternSearch({ 
  onSearch,
  placeholder = "Search..."
}: PatternSearchProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const debounce = setTimeout(() => {
      onSearch(query);
    }, 300);

    return () => clearTimeout(debounce);
  }, [query, onSearch]);

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-64 px-4 py-2 rounded-md border border-gray-300 
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   dark:bg-gray-700 dark:border-gray-600 dark:text-white
                   dark:placeholder-gray-400"
      />
      {query && (
        <button
          onClick={() => setQuery('')}
          className="absolute right-2 top-1/2 -translate-y-1/2
                     text-gray-400 hover:text-gray-600
                     dark:text-gray-500 dark:hover:text-gray-300"
        >
          ×
        </button>
      )}
    </div>
  );
}