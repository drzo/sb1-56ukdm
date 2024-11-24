import React from 'react';
import { Pattern } from '../../../../lib/types';

interface PatternOutgoingLinksProps {
  outgoing: (string | Pattern)[] | undefined;
  onChange: (outgoing: (string | Pattern)[]) => void;
}

export const PatternOutgoingLinks: React.FC<PatternOutgoingLinksProps> = ({ outgoing, onChange }) => {
  const handleAddLink = () => {
    onChange([...(outgoing || []), '']);
  };

  const handleRemoveLink = (index: number) => {
    const newOutgoing = [...(outgoing || [])];
    newOutgoing.splice(index, 1);
    onChange(newOutgoing);
  };

  const handleLinkChange = (index: number, value: string) => {
    const newOutgoing = [...(outgoing || [])];
    newOutgoing[index] = value;
    onChange(newOutgoing);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium">Outgoing Links</label>
        <button
          type="button"
          onClick={handleAddLink}
          className="text-sm text-blue-500 hover:text-blue-600"
        >
          Add Link
        </button>
      </div>
      
      {outgoing?.map((link, index) => (
        <div key={index} className="flex gap-2">
          <input
            type="text"
            value={typeof link === 'string' ? link : ''}
            onChange={(e) => handleLinkChange(index, e.target.value)}
            placeholder="Atom ID or Pattern"
            className="flex-1 border rounded p-2"
          />
          <button
            type="button"
            onClick={() => handleRemoveLink(index)}
            className="text-red-500 hover:text-red-600"
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
};