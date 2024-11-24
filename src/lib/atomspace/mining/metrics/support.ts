import { Atom, Pattern } from '../../../types';

export class SupportCalculator {
  constructor(private atomSpace: Map<string, Atom>) {}

  calculateSupport(instances: Atom[][]): number {
    return instances.length / this.atomSpace.size;
  }

  calculateConfidence(instances: Atom[][]): number {
    if (instances.length === 0) return 0;

    const validInstances = instances.filter(atoms => 
      atoms.every(atom => atom.truthValue && atom.truthValue.confidence > 0.5)
    );

    return validInstances.length / instances.length;
  }

  calculateRelativeSupport(pattern: Pattern, subPattern: Pattern): number {
    const patternInstances = this.countInstances(pattern);
    const subPatternInstances = this.countInstances(subPattern);
    
    return patternInstances > 0 ? subPatternInstances / patternInstances : 0;
  }

  private countInstances(pattern: Pattern): number {
    let count = 0;
    Array.from(this.atomSpace.values()).forEach(atom => {
      if (this.matchesPattern(atom, pattern)) count++;
    });
    return count;
  }

  private matchesPattern(atom: Atom, pattern: Pattern): boolean {
    if (pattern.type && pattern.type !== atom.type) return false;
    if (pattern.name && pattern.name !== atom.name) return false;
    return true;
  }
}