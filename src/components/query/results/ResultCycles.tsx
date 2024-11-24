import React from 'react';

interface ResultCyclesProps {
  cyclicPaths?: string[];
}

export const ResultCycles: React.FC<ResultCyclesProps> = ({ cyclicPaths }) => {
  if (!cyclicPaths || cyclicPaths.length === 0) return null;

  return (
    <div className="mt-3 space-y-2">
      <h5 className="text-sm font-medium text-amber-600">Detected Cycles:</h5>
      <div className="bg-amber-50 p-3 rounded-md">
        <ul className="list-disc list-inside text-sm space-y-1">
          {cyclicPaths.map((path, index) => (
            <li key={index} className="text-amber-700">
              {path}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};