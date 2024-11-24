import React from 'react';
import { QueryResult } from '../../../lib/types';
import { ResultItem } from './ResultItem';

interface QueryResultsProps {
  results: QueryResult[];
}

export const QueryResults: React.FC<QueryResultsProps> = ({ results }) => {
  if (results.length === 0) {
    return <div className="text-gray-500">No results found</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-medium">Results ({results.length})</h4>
      </div>

      {results.map((result, index) => (
        <ResultItem key={index} result={result} index={index} />
      ))}
    </div>
  );
};