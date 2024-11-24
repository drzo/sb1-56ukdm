import React from 'react';
import { BindingMap } from '../../../lib/types';

interface ResultBindingsProps {
  bindings: BindingMap;
}

export const ResultBindings: React.FC<ResultBindingsProps> = ({ bindings }) => {
  if (Object.keys(bindings).length === 0) return null;

  return (
    <div className="mt-3 space-y-2">
      <h5 className="text-sm font-medium">Variable Bindings:</h5>
      <div className="bg-gray-50 p-3 rounded-md">
        <ul className="list-disc list-inside text-sm space-y-1">
          {Object.entries(bindings).map(([variable, atom]) => (
            <li key={variable} className="text-gray-700">
              <span className="font-medium">{variable}</span> → {atom.type} - {atom.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};