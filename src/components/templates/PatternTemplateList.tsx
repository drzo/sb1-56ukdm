import React from 'react';
import { PatternTemplate } from '../../lib/types';
import { PatternTemplateItem } from './PatternTemplateItem';

interface PatternTemplateListProps {
  templates: PatternTemplate[];
  onSelect: (template: PatternTemplate) => void;
  onDelete: (id: string) => void;
}

export const PatternTemplateList: React.FC<PatternTemplateListProps> = ({
  templates,
  onSelect,
  onDelete
}) => {
  return (
    <div className="space-y-2">
      {templates.map(template => (
        <PatternTemplateItem
          key={template.id}
          template={template}
          onSelect={() => onSelect(template)}
          onDelete={() => onDelete(template.id)}
        />
      ))}
    </div>
  );
};