import { useState } from 'react';
import CharacterNetwork from '../components/characters/Network';
import CharacterProfile from '../components/characters/Profile';

export default function Characters() {
  const [selectedCharacter, setSelectedCharacter] = useState(null);

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold mb-6 dark:text-white">
          Community Characters
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold dark:text-white">Network</h2>
            <div className="h-[600px] bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <CharacterNetwork onSelect={setSelectedCharacter} />
            </div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold dark:text-white">Profile</h2>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
              <CharacterProfile character={selectedCharacter} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}