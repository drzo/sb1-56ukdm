import React from 'react';
import { Pattern, PatternTemplate } from '../../lib/types';

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
      <input
        type="text"
        placeholder="Template Name"
        className="w-full border rounded p-2"
        value={template.name}
        onChange={(e) => onSave({ ...template, name: e.target.value })}
        required
      />
      <textarea
        placeholder="Description (optional)"
        className="w-full border rounded p-2"
        value={template.description}
        onChange={(e) => onSave({ ...template, description: e.target.value })}
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