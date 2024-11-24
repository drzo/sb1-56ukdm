interface NamespaceSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export default function NamespaceSearch({
  onSearch,
  placeholder = "Search..."
}: NamespaceSearchProps) {
  return (
    <div className="relative">
      <input
        type="text"
        onChange={(e) => onSearch(e.target.value)}
        placeholder={placeholder}
        className="w-64 px-4 py-2 rounded-md border border-gray-300 
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   dark:bg-gray-700 dark:border-gray-600 dark:text-white
                   dark:placeholder-gray-400"
      />
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <svg 
          className="h-5 w-5 text-gray-400" 
          fill="none" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth="2" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </div>
  );
}