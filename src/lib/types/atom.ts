export type AtomType = 
  | 'ConceptNode'
  | 'PredicateNode'
  | 'ListLink'
  | 'EvaluationLink'
  | 'InheritanceLink'
  | 'SimilarityLink'
  | 'ExecutionLink';

export interface TruthValue {
  strength: number;
  confidence: number;
}

export interface Atom {
  id: string;
  type: AtomType;
  name?: string;
  value?: any;
  outgoing?: string[];
  incoming?: string[];
  truthValue?: TruthValue;
  height?: number;
  metadata?: Record<string, any>;
}

export type TruthValueOperator = 
  | 'REVISION'
  | 'DEDUCTION'
  | 'INTERSECTION'
  | 'UNION';

export interface Pattern {
  type?: AtomType;
  name?: string;
  isVariable?: boolean;
  variableName?: string;
  operator?: 'AND' | 'OR' | 'NOT';
  patterns?: Pattern[];
  outgoing?: (Pattern | string)[];
  tvOperator?: TruthValueOperator;
  recursive?: {
    maxDepth?: number;
    detectCycles?: boolean;
  };
}

export interface BindingMap {
  [key: string]: Atom;
}

export interface QueryResult {
  atoms: Atom[];
  bindings: BindingMap;
  computedTruthValue?: TruthValue;
  depth: number;
}