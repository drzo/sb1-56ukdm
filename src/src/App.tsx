import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Chat from './pages/Chat';
import NeuralNetwork from './pages/NeuralNetwork';
import MemoryStore from './pages/MemoryStore';
import Settings from './pages/Settings';
import Integrations from './pages/Integrations';
import Characters from './pages/Characters';
import CharacterProfile from './pages/CharacterProfile';
import StoryTelling from './pages/StoryTelling';
import WorldBuilding from './pages/WorldBuilding';
import SystemModel from './pages/SystemModel';

function App() {
  const [isDark, setIsDark] = useState(false);

  return (
    <BrowserRouter>
      <div className={isDark ? 'dark' : ''}>
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
          <Sidebar />
          <Routes>
            <Route path="/" element={<Chat isDark={isDark} setIsDark={setIsDark} />} />
            <Route path="/neural-network" element={<NeuralNetwork isDark={isDark} setIsDark={setIsDark} />} />
            <Route path="/memory-store" element={<MemoryStore isDark={isDark} setIsDark={setIsDark} />} />
            <Route path="/settings" element={<Settings isDark={isDark} setIsDark={setIsDark} />} />
            <Route path="/integrations" element={<Integrations isDark={isDark} setIsDark={setIsDark} />} />
            <Route path="/characters" element={<Characters isDark={isDark} setIsDark={setIsDark} />} />
            <Route path="/characters/:id" element={<CharacterProfile isDark={isDark} setIsDark={setIsDark} />} />
            <Route path="/storytelling" element={<StoryTelling isDark={isDark} setIsDark={setIsDark} />} />
            <Route path="/world-building" element={<WorldBuilding isDark={isDark} setIsDark={setIsDark} />} />
            <Route path="/system-model" element={<SystemModel isDark={isDark} setIsDark={setIsDark} />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;