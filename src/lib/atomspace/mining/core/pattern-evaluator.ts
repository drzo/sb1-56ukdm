import { Atom, Pattern, MinedPattern } from '../../../types';
import { PatternMatcher } from '../../matching/pattern-matcher';

export class PatternEvaluator {
  private atomSpace: Map<string, Atom>;

  constructor(atomSpace: Map<string, Atom>) {
    this.atomSpace = atomSpace;
  }

  evaluatePattern(pattern: Pattern): MinedPattern {
    const instances = this.findInstances(pattern);
    const support = this.calculateSupport(instances.length);
    const confidence = this.calculateConfidence(instances);
    const interestingness = this.calculateInterestingness(pattern, instances);

    return {
      pattern,
      instances,
      support,
      confidence,
      interestingness
    };
  }

  private findInstances(pattern: Pattern): Atom[][] {
    const instances: Atom[][] = [];
    const matcher = new PatternMatcher();

    Array.from(this.atomSpace.values()).forEach(atom => {
      const result = matcher.match(atom, pattern, {}, {
        atomSpace: this.atomSpace,
        visited: new Set(),
        depth: 0
      });

      if (result?.matched) {
        instances.push(result.matchedAtoms);
      }
    });

    return instances;
  }

  private calculateSupport(instanceCount: number): number {
    return instanceCount / this.atomSpace.size;
  }

  private calculateConfidence(instances: Atom[][]): number {
    if (instances.length === 0) return 0;

    const validInstances = instances.filter(atoms => 
      atoms.every(atom => atom.truthValue && atom.truthValue.confidence > 0.5)
    );

    return validInstances.length / instances.length;
  }

  private calculateInterestingness(pattern: Pattern, instances: Atom[][]): number {
    const support = this.calculateSupport(instances.length);
    const confidence = this.calculateConfidence(instances);
    const complexity = this.calculatePatternComplexity(pattern);
    
    // Combine factors with weights
    return (support * 0.3) + (confidence * 0.4) + (1 / complexity * 0.3);
  }

  private calculatePatternComplexity(pattern: Pattern): number {
    let complexity = 1;

    if (pattern.patterns) {
      complexity += pattern.patterns.reduce((sum, p) => 
        sum + this.calculatePatternComplexity(p), 0
      );
    }

    if (pattern.outgoing) {
      complexity += pattern.outgoing.reduce((sum, p) => 
        sum + (typeof p === 'string' ? 1 : this.calculatePatternComplexity(p)), 0
      );
    }

    if (pattern.recursive) {
      complexity *= 1.5;
    }

    return complexity;
  }
}</content>