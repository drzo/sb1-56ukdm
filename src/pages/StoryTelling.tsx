import React from 'react';
import Header from '../components/Header';
import { Book, Bookmark, Clock, Star } from 'lucide-react';

interface StoryTellingProps {
  isDark: boolean;
  setIsDark: (isDark: boolean) => void;
}

export default function StoryTelling({ isDark, setIsDark }: StoryTellingProps) {
  const stories = [
    {
      title: "The Birth of Deep Tree Echo",
      excerpt: "In the early days of the neural revolution...",
      author: "Neural Sage",
      date: "2024-03-15",
      category: "Origin Story",
      readTime: "5 min",
      rating: 4.8
    },
    {
      title: "Adventures in the Digital Realm",
      excerpt: "Exploring the vast networks of knowledge...",
      author: "Deep Tree Echo",
      date: "2024-03-14",
      category: "Adventure",
      readTime: "8 min",
      rating: 4.9
    }
  ];

  return (
    <main className="flex-1 flex flex-col">
      <Header title="Story Telling" isDark={isDark} setIsDark={setIsDark} />
      
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {stories.map((story, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/50 rounded-full">
                  {story.category}
                </span>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {story.readTime}
                  </span>
                </div>
              </div>
              
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {story.title}
              </h2>
              
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {story.excerpt}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Book className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    By {story.author}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {story.rating}
                    </span>
                  </div>
                  <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">
                    <Bookmark className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}