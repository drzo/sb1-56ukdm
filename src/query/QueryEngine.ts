import { Atom } from '../../types/Atom';
import { Pattern, PatternMatcher } from '../pattern/PatternMatcher';
import { AtomSpaceCore } from '../core/AtomSpaceCore';
import { Statistics } from '../../cogutil/Statistics';
import { Logger } from '../../cogutil/Logger';

export interface QueryResult {
  atoms: Atom[];
  matchCount: number;
  executionTime: number;
}

export class QueryEngine {
  private atomspace: AtomSpaceCore;
  private patternMatcher: PatternMatcher;

  constructor(atomspace: AtomSpaceCore) {
    this.atomspace = atomspace;
    this.patternMatcher = new PatternMatcher(atomspace);
  }

  async query(pattern: Pattern): Promise<QueryResult> {
    const startTime = performance.now();
    
    try {
      const matches = this.patternMatcher.findMatches(pattern);
      const executionTime = performance.now() - startTime;

      Logger.info(`Query executed in ${executionTime}ms, found ${matches.length} matches`);

      return {
        atoms: matches,
        matchCount: matches.length,
        executionTime
      };
    } catch (error) {
      Logger.error('Query execution failed', { error, pattern });
      throw error;
    }
  }

  async findSimilar(atom: Atom, similarityThreshold: number = 0.8): Promise<Atom[]> {
    const typeMatches = this.atomspace.getAtomsByType(atom.getType());
    const tv1 = atom.getTruthValue();

    return typeMatches.filter(other => {
      const tv2 = other.getTruthValue();
      
      const strengthDiff = Math.abs(tv1.strength - tv2.strength);
      const confidenceDiff = Math.abs(tv1.confidence - tv2.confidence);
      
      const similarity = 1 - (strengthDiff + confidenceDiff) / 2;
      return similarity >= similarityThreshold;
    });
  }

  async analyze(atoms: Atom[]): Promise<{
    truthValueStats: {
      meanStrength: number;
      meanConfidence: number;
      strengthStdDev: number;
      confidenceStdDev: number;
    };
    typeDistribution: Record<string, number>;
  }> {
    const strengths = atoms.map(a => a.getTruthValue().strength);
    const confidences = atoms.map(a => a.getTruthValue().confidence);

    const typeCount: Record<string, number> = {};
    atoms.forEach(atom => {
      const type = atom.getType();
      typeCount[type] = (typeCount[type] || 0) + 1;
    });

    return {
      truthValueStats: {
        meanStrength: Statistics.mean(strengths),
        meanConfidence: Statistics.mean(confidences),
        strengthStdDev: Statistics.standardDeviation(strengths),
        confidenceStdDev: Statistics.standardDeviation(confidences)
      },
      typeDistribution: typeCount
    };
  }
}