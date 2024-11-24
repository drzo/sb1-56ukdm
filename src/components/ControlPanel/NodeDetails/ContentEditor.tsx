import React from 'react';

interface ContentEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export const ContentEditor: React.FC<ContentEditorProps> = ({ content, onChange }) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">Content</label>
      <textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-32 px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white text-sm resize-none"
        placeholder="Enter memory content..."
      />
    </div>
  );
};