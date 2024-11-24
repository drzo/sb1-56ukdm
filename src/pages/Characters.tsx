import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { Brain, Star, MessageSquare } from 'lucide-react';

interface CharactersProps {
  isDark: boolean;
  setIsDark: (isDark: boolean) => void;
}

const characters = [
  {
    id: 'deep-tree-echo',
    name: 'Deep Tree Echo',
    role: 'AGI Assistant',
    description: 'An expert AI assistant with deep knowledge of programming and system architecture.',
    avatar: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=400&h=400&fit=crop',
    rating: 4.9,
    conversations: 12453,
  },
  {
    id: 'neural-sage',
    name: 'Neural Sage',
    role: 'Knowledge Guide',
    description: 'Specialized in explaining complex neural networks and AI concepts.',
    avatar: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&h=400&fit=crop',
    rating: 4.8,
    conversations: 8234,
  },
  // Add more characters here
];

export default function Characters({ isDark, setIsDark }: CharactersProps) {
  return (
    <main className="flex-1 flex flex-col">
      <Header title="Character Listings" isDark={isDark} setIsDark={setIsDark} />
      
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {characters.map((character) => (
            <Link
              key={character.id}
              to={`/characters/${character.id}`}
              className="group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex items-start gap-4">
                <img
                  src={character.avatar}
                  alt={character.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    {character.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{character.role}</p>
                </div>
              </div>
              
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                {character.description}
              </p>
              
              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {character.rating}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {character.conversations.toLocaleString()} chats
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}