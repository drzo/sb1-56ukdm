import React from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { Repository } from '../types/Repository';

interface RepositoryCardProps {
  repository: Repository;
}

export function RepositoryCard({ repository }: RepositoryCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-gray-900">{repository.name}</h3>
        <div className="flex items-center text-yellow-500">
          <StarIcon className="h-5 w-5 mr-1" />
          <span className="text-gray-600">{repository.stars}</span>
        </div>
      </div>
      <p className="text-gray-600 text-sm">{repository.description}</p>
      <div className="mt-4">
        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
          {repository.category}
        </span>
      </div>
    </div>
  );
}