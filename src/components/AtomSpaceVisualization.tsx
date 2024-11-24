import React from 'react';
import { useAtomSpace } from '../lib/atomspace';
import { AtomGraph } from './atom/graph/AtomGraph';

interface AtomSpaceVisualizationProps {
  isDarkMode: boolean;
}

export const AtomSpaceVisualization: React.FC<AtomSpaceVisualizationProps> = ({ isDarkMode }) => {
  const atomSpace = useAtomSpace();
  const atoms = Array.from(atomSpace.atoms.values());

  return (
    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <AtomGraph 
        atoms={atoms}
        width={800}
        height={600}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};