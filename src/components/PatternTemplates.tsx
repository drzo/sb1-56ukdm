import React, { useState } from 'react';
import { useAtomSpace } from '../lib/atomspace';
import { Pattern, PatternTemplate } from '../lib/types';
import { PatternTemplateForm } from './templates/PatternTemplateForm';
import { PatternTemplateList } from './templates/PatternTemplateList';

interface PatternTemplatesProps {
  onSelectTemplate: (pattern: Pattern) => void;
  currentPattern?: Pattern;
}

export const PatternTemplates: React.FC<PatternTemplatesProps> = ({ 
  onSelectTemplate,
  currentPattern 
}) => {
  const atomSpace = useAtomSpace();
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [newTemplate, setNewTemplate] = useState<Omit<PatternTemplate, 'id' | 'created'>>({
    name: '',
    description: '',
    pattern: {} as Pattern
  });

  const templates = Array.from(atomSpace.templates.values())
    .sort((a, b) => (b.lastUsed || b.created).localeCompare(a.lastUsed || a.created));

  const handleSaveTemplate = (template: Omit<PatternTemplate, 'id' | 'created'>) => {
    if (currentPattern) {
      atomSpace.saveTemplate({
        ...template,
        pattern: currentPattern
      });
      setShowSaveForm(false);
      setNewTemplate({ name: '', description: '', pattern: {} as Pattern });
    }
  };

  const handleSelectTemplate = (template: PatternTemplate) => {
    atomSpace.updateTemplateLastUsed(template.id);
    onSelectTemplate(template.pattern);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Pattern Templates</h3>
        <button
          onClick={() => setShowSaveForm(true)}
          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
          disabled={!currentPattern}
        >
          Save Current Pattern
        </button>
      </div>

      {showSaveForm && (
        <PatternTemplateForm
          template={newTemplate}
          onSave={handleSaveTemplate}
          onCancel={() => {
            setShowSaveForm(false);
            setNewTemplate({ name: '', description: '', pattern: {} as Pattern });
          }}
        />
      )}

      <PatternTemplateList
        templates={templates}
        onSelect={handleSelectTemplate}
        onDelete={(id) => atomSpace.removeTemplate(id)}
      />
    </div>
  );
};