import { Pattern, Atom } from '../../../types';

export type InterestingnessMeasure = 
  | 'frequency'
  | 'surprisingness'
  | 'interaction-information'
  | 'mutual-information';

export class InterestingnessCalculator {
  constructor(private atomSpace: Map<string, Atom>) {}

  calculate(
    pattern: Pattern,
    instances: Atom[][],
    measure: InterestingnessMeasure = 'frequency'
  ): number {
    switch (measure) {
      case 'frequency':
        return this.calculateFrequency(instances.length);
      case 'surprisingness':
        return this.calculateSurprisingness(pattern, instances);
      case 'interaction-information':
        return this.calculateInteractionInformation(pattern, instances);
      case 'mutual-information':
        return this.calculateMutualInformation(pattern, instances);
      default:
        return 0;
    }
  }

  private calculateFrequency(instanceCount: number): number {
    return instanceCount / this.atomSpace.size;
  }

  private calculateSurprisingness(pattern: Pattern, instances: Atom[][]): number {
    const observed = instances.length / this.atomSpace.size;
    const expected = this.calculateExpectedProbability(pattern);
    return Math.abs(observed - expected);
  }

  private calculateExpectedProbability(pattern: Pattern): number {
    if (!pattern.patterns) return 0;
    
    const individualProbs = pattern.patterns.map(p => 
      this.getPatternProbability(p)
    );
    
    return individualProbs.reduce((a, b) => a * b, 1);
  }

  private calculateInteractionInformation(pattern: Pattern, instances: Atom[][]): number {
    if (!pattern.patterns || pattern.patterns.length < 2) return 0;

    const joint = instances.length / this.atomSpace.size;
    const individual = pattern.patterns.map(p => this.getPatternProbability(p));
    const pairwise = this.getPairwiseProbabilities(pattern.patterns);

    let ii = joint;
    individual.forEach(p => ii -= p);
    pairwise.forEach(p => ii += p);

    return Math.abs(ii);
  }

  private calculateMutualInformation(pattern: Pattern, instances: Atom[][]): number {
    if (!pattern.patterns || pattern.patterns.length !== 2) return 0;

    const joint = instances.length / this.atomSpace.size;
    const [p1, p2] = pattern.patterns;
    const prob1 = this.getPatternProbability(p1);
    const prob2 = this.getPatternProbability(p2);

    if (prob1 === 0 || prob2 === 0) return 0;
    return joint * Math.log2(joint / (prob1 * prob2));
  }

  private getPatternProbability(pattern: Pattern): number {
    let matchCount = 0;
    Array.from(this.atomSpace.values()).forEach(atom => {
      if (this.matchesPattern(atom, pattern)) {
        matchCount++;
      }
    });
    return matchCount / this.atomSpace.size;
  }

  private getPairwiseProbabilities(patterns: Pattern[]): number[] {
    const probs: number[] = [];
    for (let i = 0; i < patterns.length; i++) {
      for (let j = i + 1; j < patterns.length; j++) {
        const pairPattern = {
          operator: 'AND',
          patterns: [patterns[i], patterns[j]]
        };
        probs.push(this.getPatternProbability(pairPattern));
      }
    }
    return probs;
  }

  private matchesPattern(atom: Atom, pattern: Pattern): boolean {
    // Simple pattern matching for probability calculation
    if (pattern.type && pattern.type !== atom.type) return false;
    if (pattern.name && pattern.name !== atom.name) return false;
    return true;
  }
}