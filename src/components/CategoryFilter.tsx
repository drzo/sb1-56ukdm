import React from 'react';
import { clsx } from 'clsx';
import { Repository } from '../types/Repository';

interface CategoryFilterProps {
  categories: Repository['category'][];
  selectedCategory: Repository['category'] | 'All';
  onSelectCategory: (category: Repository['category'] | 'All') => void;
}

export function CategoryFilter({ categories, selectedCategory, onSelectCategory }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <button
        onClick={() => onSelectCategory('All')}
        className={clsx(
          'px-4 py-2 rounded-full text-sm font-medium transition-colors',
          selectedCategory === 'All'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        )}
      >
        All
      </button>
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onSelectCategory(category)}
          className={clsx(
            'px-4 py-2 rounded-full text-sm font-medium transition-colors',
            selectedCategory === category
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          )}
        >
          {category}
        </button>
      ))}
    </div>
  );
}