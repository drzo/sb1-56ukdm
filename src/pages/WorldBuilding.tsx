import React from 'react';
import Header from '../components/Header';
import WorldGraph from '../components/WorldGraph';

interface WorldBuildingProps {
  isDark: boolean;
  setIsDark: (isDark: boolean) => void;
}

export default function WorldBuilding({ isDark, setIsDark }: WorldBuildingProps) {
  return (
    <main className="flex-1 flex flex-col">
      <Header title="World Building" isDark={isDark} setIsDark={setIsDark} />
      
      <div className="flex-1 p-6">
        <div className="h-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <WorldGraph isDark={isDark} />
        </div>
      </div>
    </main>
  );
}