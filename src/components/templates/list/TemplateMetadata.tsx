import React from 'react';

interface TemplateMetadataProps {
  created: string;
  lastUsed?: string;
}

export const TemplateMetadata: React.FC<TemplateMetadataProps> = ({ created, lastUsed }) => {
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
    <div className="text-xs text-gray-500 mt-2">
      <div>Created: {formatDate(created)}</div>
      <div>Last used: {lastUsed ? formatDate(lastUsed) : 'Never'}</div>
    </div>
  );
};