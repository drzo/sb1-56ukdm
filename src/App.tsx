import React from 'react';
import { AtomSpaceVisualization } from './components/AtomSpaceVisualization';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <header className="max-w-7xl mx-auto mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
          OpenCog JS
        </h1>
      </header>
      <main className="max-w-7xl mx-auto">
        <AtomSpaceVisualization isDarkMode={true} />
      </main>
    </div>
  );
};

export default App;