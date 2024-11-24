import React, { useState } from 'react';
import { useAtomSpace } from '../../lib/atomspace';
import { Pattern, LogicalOperator, TruthValueOperator, QueryResult, RecursiveOptions as RecursiveOptionsType } from '../../lib/types';
import { PatternForm } from './pattern/form/PatternForm';
import { OperatorSelector } from './operators/OperatorSelector';
import { RecursiveOptions } from './recursive/RecursiveOptions';
import { SearchButton } from './search/SearchButton';
import { QueryResults } from './results/QueryResults';
import { PatternTemplateList } from '../templates/list/PatternTemplateList';

export const QueryInterface: React.FC = () => {
  const atomSpace = useAtomSpace();
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [operator, setOperator] = useState<LogicalOperator>();
  const [tvOperator, setTvOperator] = useState<TruthValueOperator>();
  const [recursiveOptions, setRecursiveOptions] = useState<RecursiveOptionsType>({});
  const [results, setResults] = useState<QueryResult[]>([]);

  const handleAddPattern = () => {
    setPatterns([...patterns, {}]);
  };

  const handlePatternChange = (index: number, pattern: Pattern) => {
    const newPatterns = [...patterns];
    newPatterns[index] = pattern;
    setPatterns(newPatterns);
  };

  const handleRemovePattern = (index: number) => {
    setPatterns(patterns.filter((_, i) => i !== index));
  };

  const getCurrentPattern = (): Pattern | undefined => {
    if (patterns.length === 0) return undefined;
    if (patterns.length === 1) return patterns[0];
    return {
      operator,
      patterns,
      tvOperator,
      recursive: recursiveOptions
    };
  };

  const handleSearch = () => {
    const query = getCurrentPattern();
    if (query) {
      const results = atomSpace.findPatterns(query);
      setResults(results);
    }
  };

  const handleLoadTemplate = (pattern: Pattern) => {
    if (pattern.patterns) {
      setPatterns(pattern.patterns);
      setOperator(pattern.operator);
      setTvOperator(pattern.tvOperator);
    } else {
      setPatterns([pattern]);
    }
    
    if (pattern.recursive) {
      setRecursiveOptions(pattern.recursive);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg shadow">
        <PatternTemplateList
          templates={Array.from(atomSpace.templates.values())}
          onSelect={(template) => {
            atomSpace.updateTemplateLastUsed(template.id);
            handleLoadTemplate(template.pattern);
          }}
          onDelete={(id) => atomSpace.removeTemplate(id)}
        />
      </div>

      <div className="space-y-4">
        {patterns.map((pattern, index) => (
          <PatternForm
            key={index}
            pattern={pattern}
            onChange={(p) => handlePatternChange(index, p)}
            onRemove={() => handleRemovePattern(index)}
          />
        ))}

        <button
          onClick={handleAddPattern}
          className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add Pattern
        </button>
      </div>

      {patterns.length > 1 && (
        <OperatorSelector
          logicalOperator={operator}
          tvOperator={tvOperator}
          onLogicalOperatorChange={setOperator}
          onTvOperatorChange={setTvOperator}
        />
      )}

      <RecursiveOptions
        options={recursiveOptions}
        onChange={setRecursiveOptions}
      />

      <SearchButton
        onClick={handleSearch}
        disabled={patterns.length === 0}
      />

      <QueryResults results={results} />
    </div>
  );
};