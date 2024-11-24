import { useState } from 'react';
import MemoryIndex from '../components/memory/MemoryIndex';
import DeclarativeMemory from '../components/memory/DeclarativeMemory';
import EpisodicMemory from '../components/memory/EpisodicMemory';
import ProceduralMemory from '../components/memory/ProceduralMemory';
import SemanticMemory from '../components/memory/SemanticMemory';

type MemorySection = 'index' | 'declarative' | 'episodic' | 'procedural' | 'semantic';

export default function Memory() {
  const [activeSection, setActiveSection] = useState<MemorySection>('index');

  const sections = [
    { id: 'index', label: 'Overview' },
    { id: 'declarative', label: 'Declarative' },
    { id: 'episodic', label: 'Episodic' },
    { id: 'procedural', label: 'Procedural' },
    { id: 'semantic', label: 'Semantic' }
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6 dark:text-white">
            Memory Systems
          </h1>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-1 border-b dark:border-gray-700 mb-6">
            {sections.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as MemorySection)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors
                  ${activeSection === section.id
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
              >
                {section.label}
              </button>
            ))}
          </div>

          {/* Content Section - Horizontal Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Visualization */}
            <div className="h-[600px] bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              {activeSection === 'index' && <MemoryIndex showMetrics={false} />}
              {activeSection === 'declarative' && <DeclarativeMemory showMetrics={false} />}
              {activeSection === 'episodic' && <EpisodicMemory showMetrics={false} />}
              {activeSection === 'procedural' && <ProceduralMemory showMetrics={false} />}
              {activeSection === 'semantic' && <SemanticMemory showMetrics={false} />}
            </div>

            {/* Right Column - Metrics and Details */}
            <div className="space-y-4">
              {activeSection === 'index' && <MemoryIndex showVisualization={false} />}
              {activeSection === 'declarative' && <DeclarativeMemory showVisualization={false} />}
              {activeSection === 'episodic' && <EpisodicMemory showVisualization={false} />}
              {activeSection === 'procedural' && <ProceduralMemory showVisualization={false} />}
              {activeSection === 'semantic' && <SemanticMemory showVisualization={false} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}