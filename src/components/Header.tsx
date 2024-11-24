import React from 'react';
import { Moon, Sun } from 'lucide-react';

interface HeaderProps {
  title: string;
  isDark: boolean;
  setIsDark: (isDark: boolean) => void;
}

export default function Header({ title, isDark, setIsDark }: HeaderProps) {
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <span className="px-2.5 py-0.5 text-xs font-medium text-green-800 dark:text-green-200 bg-green-100 dark:bg-green-900 rounded-full">
            Connected
          </span>
        </div>
      </div>
    </header>
  );
}