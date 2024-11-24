import { TruthValue } from './truth-values';
import { AttentionValue } from './attention';

export type AtomType = 
  | 'ConceptNode'
  | 'PredicateNode'
  | 'VariableNode'
  | 'NumberNode'
  | 'TypeNode'
  | 'ListLink'
  | 'EvaluationLink'
  | 'InheritanceLink'
  | 'SimilarityLink'
  | 'ImplicationLink';

export interface Atom {
  id: string;
  type: AtomType;
  name: string;
  value?: any;
  outgoing?: string[];
  truthValue?: TruthValue;
  attention?: AttentionValue;
  metadata?: {
    creator?: string;
    timestamp?: number;
    source?: string;
  };
}