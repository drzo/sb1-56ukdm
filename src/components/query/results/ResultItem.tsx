import React from 'react';
import { QueryResult } from '../../../lib/types';
import { ResultBindings } from './ResultBindings';
import { ResultAtoms } from './ResultAtoms';
import { ResultCycles } from './ResultCycles';
import { TruthValueDisplay } from '../../truth-value/display/TruthValueDisplay';

interface ResultItemProps {
  result: QueryResult;
  index: number;
}

export const ResultItem: React.FC<ResultItemProps> = ({ result, index }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-medium">Result {index + 1}</h4>
        {result.depth !== undefined && (
          <div className="flex gap-2 text-sm text-gray-500">
            <span>Depth: {result.depth}</span>
            {result.recursiveDepth !== undefined && (
              <span>Recursive Depth: {result.recursiveDepth}</span>
            )}
          </div>
        )}
      </div>
      
      {result.computedTruthValue && (
        <div className="mb-3">
          <TruthValueDisplay 
            truthValue={result.computedTruthValue}
            label="Computed Truth Value"
          />
        </div>
      )}

      <ResultAtoms atoms={result.atoms} />
      <ResultBindings bindings={result.bindings} />
      {result.cyclicPaths && <ResultCycles cyclicPaths={result.cyclicPaths} />}
    </div>
  );
};