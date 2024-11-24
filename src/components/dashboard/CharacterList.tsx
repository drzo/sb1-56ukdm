import { useCharacterNetwork } from '../../hooks/useCharacterNetwork';
import type { NetworkNode } from '../../types';

interface CharacterListProps {
  onSelect: (character: NetworkNode) => void;
}

export default function CharacterList({ onSelect }: CharacterListProps) {
  const { data } = useCharacterNetwork();

  return (
    <div className="space-y-4">
      {data?.nodes.map(character => (
        <div
          key={character.id}
          onClick={() => onSelect(character)}
          className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <h3 className="font-medium dark:text-white">{character.name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {character.role}
          </p>
        </div>
      ))}
    </div>
  );
}