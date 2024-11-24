import React from 'react';
import { Atom } from '../../../lib/types';

interface ResultAtomsProps {
  atoms: Atom[];
}

export const ResultAtoms: React.FC<ResultAtomsProps> = ({ atoms }) => {
  return (
    <div className="space-y-2">
      <h5 className="text-sm font-medium">Matched Atoms:</h5>
      <div className="bg-gray-50 p-3 rounded-md">
        <ul className="list-disc list-inside text-sm space-y-1">
          {atoms.map(atom => (
            <li key={atom.id} className="text-gray-700">
              <span className="font-medium">{atom.type}</span> - {atom.name}
              {atom.truthValue && (
                <span className="text-gray-500">
                  {' '}(s: {atom.truthValue.strength.toFixed(2)}, c: {atom.truthValue.confidence.toFixed(2)})
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};