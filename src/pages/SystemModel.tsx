import React from 'react';
import Header from '../components/Header';
import SystemGraph from '../components/SystemGraph';

interface SystemModelProps {
  isDark: boolean;
  setIsDark: (isDark: boolean) => void;
}

export default function SystemModel({ isDark, setIsDark }: SystemModelProps) {
  return (
    <main className="flex-1 flex flex-col">
      <Header title="System Model" isDark={isDark} setIsDark={setIsDark} />
      
      <div className="flex-1 p-6">
        <div className="h-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <SystemGraph isDark={isDark} />
        </div>
      </div>
    </main>
  );
}