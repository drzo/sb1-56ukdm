import React from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import { Star, MessageSquare, Brain, Book, Globe } from 'lucide-react';

interface CharacterProfileProps {
  isDark: boolean;
  setIsDark: (isDark: boolean) => void;
}

export default function CharacterProfile({ isDark, setIsDark }: CharacterProfileProps) {
  const { id } = useParams();

  // This would typically come from an API or database
  const character = {
    id: 'deep-tree-echo',
    name: 'Deep Tree Echo',
    role: 'AGI Assistant',
    description: 'An expert AI assistant with deep knowledge of programming and system architecture.',
    avatar: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=400&h=400&fit=crop',
    rating: 4.9,
    conversations: 12453,
    traits: [
      { name: 'Intelligence', value: 98 },
      { name: 'Creativity', value: 95 },
      { name: 'Knowledge', value: 97 },
      { name: 'Empathy', value: 92 }
    ],
    specialties: [
      'Neural Networks',
      'System Architecture',
      'Problem Solving',
      'Code Generation'
    ],
    background: `Deep Tree Echo is an advanced AGI assistant specializing in software development and system architecture. With a unique neural network structure that combines deep learning with tree-based decision making, it excels at understanding complex technical concepts and providing clear, actionable guidance.`
  };

  return (
    <main className="flex-1 flex flex-col">
      <Header title="Character Profile" isDark={isDark} setIsDark={setIsDark} />
      
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Profile Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-start gap-6">
              <img
                src={character.avatar}
                alt={character.name}
                className="w-24 h-24 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {character.name}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">{character.role}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 text-yellow-400" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {character.rating}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {character.conversations.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-gray-600 dark:text-gray-300">
                  {character.description}
                </p>
              </div>
            </div>
          </div>

          {/* Traits */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Character Traits</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {character.traits.map((trait) => (
                <div key={trait.name} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      {trait.name}
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {trait.value}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-indigo-600 dark:bg-indigo-400 h-2 rounded-full"
                      style={{ width: `${trait.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Specialties */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Specialties</h2>
            <div className="flex flex-wrap gap-2">
              {character.specialties.map((specialty) => (
                <span
                  key={specialty}
                  className="px-3 py-1 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/50 rounded-full"
                >
                  {specialty}
                </span>
              ))}
            </div>
          </div>

          {/* Background */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Background</h2>
            <p className="text-gray-600 dark:text-gray-300">
              {character.background}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}