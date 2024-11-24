import { TraitBar } from './TraitBar';
import type { NetworkNode } from '../../types';

interface CharacterProfileProps {
  character: NetworkNode | null;
}

export default function CharacterProfile({ character }: CharacterProfileProps) {
  if (!character) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400">
        Select a character to view their profile
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold dark:text-white mb-1">
          {character.name}
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          {character.role}
        </p>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium dark:text-white">Traits</h4>
        <div className="space-y-3">
          {Object.entries(character.traits).map(([trait, value]) => (
            <TraitBar
              key={trait}
              label={trait.charAt(0).toUpperCase() + trait.slice(1)}
              value={value}
            />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium dark:text-white">Connections</h4>
        <div className="flex flex-wrap gap-2">
          {character.connections.map(conn => (
            <span
              key={conn.id}
              className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full text-sm"
            >
              {conn.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}