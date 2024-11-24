import { useState } from 'react';
import type { CharacterTraits } from '../../types';

interface CharacterFormProps {
  onSubmit: (character: { name: string; role: string; traits: CharacterTraits }) => void;
  onCancel: () => void;
}

export default function CharacterForm({ onSubmit, onCancel }: CharacterFormProps) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [traits, setTraits] = useState<CharacterTraits>({
    openness: 0.5,
    conscientiousness: 0.5,
    extraversion: 0.5,
    agreeableness: 0.5,
    stability: 0.5
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, role, traits });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Name
        </label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Role
        </label>
        <input
          type="text"
          value={role}
          onChange={e => setRole(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          required
        />
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Traits
        </label>
        {Object.entries(traits).map(([trait, value]) => (
          <div key={trait}>
            <label className="block text-sm text-gray-600 dark:text-gray-400">
              {trait.charAt(0).toUpperCase() + trait.slice(1)}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={value}
              onChange={e => setTraits(prev => ({
                ...prev,
                [trait]: parseFloat(e.target.value)
              }))}
              className="w-full"
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 dark:text-gray-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Create Character
        </button>
      </div>
    </form>
  );
}