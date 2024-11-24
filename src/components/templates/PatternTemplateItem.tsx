import React from 'react';
import { PatternTemplate } from '../../lib/types';

interface PatternTemplateItemProps {
  template: PatternTemplate;
  onSelect: () => void;
  onDelete: () => void;
}

export const PatternTemplateItem: React.FC<PatternTemplateItemProps> = ({
  template,
  onSelect,
  onDelete
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div
      className="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={onSelect}
    >
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium">{template.name}</h4>
          {template.description && (
            <p className="text-sm text-gray-600 mt-1">{template.description}</p>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="text-red-500 hover:text-red-600 text-sm"
        >
          Delete
        </button>
      </div>
      <div className="text-xs text-gray-500 mt-2">
        Last used: {template.lastUsed ? formatDate(template.lastUsed) : 'Never'}
      </div>
    </div>
  );
};