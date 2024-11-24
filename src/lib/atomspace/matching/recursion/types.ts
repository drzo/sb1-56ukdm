import { MatchResult } from '../../../types';

export interface RecursiveMatchResult extends MatchResult {
  recursiveDepth: number;
  visitedPaths: Set<string>;
  cyclicPaths?: string[];
}