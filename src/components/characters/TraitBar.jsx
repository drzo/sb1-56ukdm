export function TraitBar({ label, value }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-700 dark:text-gray-300">{label}</span>
        <span className="text-gray-600 dark:text-gray-400">
          {Math.round(value * 100)}%
        </span>
      </div>
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div 
          className="h-full bg-blue-500 dark:bg-blue-400 rounded-full transition-all duration-500"
          style={{ width: `${value * 100}%` }}
        />
      </div>
    </div>
  );
}