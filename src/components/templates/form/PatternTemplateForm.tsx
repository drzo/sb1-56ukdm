import React from 'react';
import { PatternTemplate } from '../../../lib/types';
import { TemplateNameInput } from './TemplateNameInput';
import { TemplateDescriptionInput } from './TemplateDescriptionInput';

interface PatternTemplateFormProps {
  template: Omit<PatternTemplate, 'id' | 'created'>;
  onSave: (template: Omit<PatternTemplate, 'id' | 'created'>) => void;
  onCancel: () => void;
}

export const PatternTemplateForm: React.FC<PatternTemplateFormProps> = ({
  template,
  onSave,
  onCancel
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (template.name.trim()) {
      onSave(template);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-sm space-y-3">
      <TemplateNameInput
        value={template.name}
        onChange={(name) => onSave({ ...template, name })}
      />
      <TemplateDescriptionInput
        value={template.description}
        onChange={(description) => onSave({ ...template, description })}
      />
      <div className="flex gap-2">
        <button
          type="submit"
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};