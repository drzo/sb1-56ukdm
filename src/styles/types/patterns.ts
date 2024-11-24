export interface Pattern {
  id: number;
  name: string;
  description: string;
  context: string;
  problem: string;
  solution: string;
  broaderPatterns: number[];  // Dependencies/patterns this one relies on
  narrowerPatterns: number[]; // Patterns that rely on this one
  examples?: string[];
}

export interface PatternNode {
  name: string;
  description?: string;
  children?: (PatternNode | Pattern)[];
}

export interface PatternCategory {
  name: string;
  description: string;
  patterns: Pattern[];
}