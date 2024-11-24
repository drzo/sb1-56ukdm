import { MinedPattern } from '../../types';
import { MiningConfig } from '../core/mining-controller';

export class TemporalMetrics {
  constructor(private config: MiningConfig) {}

  isSignificant(pattern: MinedPattern): boolean {
    return pattern.support >= this.config.minSupport &&
           pattern.confidence >= this.config.minConfidence &&
           this.getTemporalSignificance(pattern) > 0.3;
  }

  getTemporalSignificance(pattern: MinedPattern): number {
    const temporalScore = this.calculateTemporalScore(pattern);
    const regularityScore = this.calculateRegularityScore(pattern);
    const coverageScore = this.calculateCoverageScore(pattern);

    return (temporalScore * 0.4) +
           (regularityScore * 0.3) +
           (coverageScore * 0.3);
  }

  private calculateTemporalScore(pattern: MinedPattern): number {
    // Calculate temporal relationship strength
    if (!pattern.pattern.type?.includes('Temporal')) return 0;

    const instances = pattern.instances;
    if (instances.length < 2) return 0;

    // Calculate temporal consistency across instances
    const consistencyScores = instances.map(instance =>
      this.calculateInstanceConsistency(instance)
    );

    return consistencyScores.reduce((a, b) => a + b, 0) / consistencyScores.length;
  }

  private calculateInstanceConsistency(instance: Atom[]): number {
    if (instance.length < 2) return 0;

    // Check temporal ordering consistency
    const orderedPairs = this.countOrderedPairs(instance);
    const totalPairs = (instance.length * (instance.length - 1)) / 2;

    return orderedPairs / totalPairs;
  }

  private countOrderedPairs(atoms: Atom[]): number {
    let count = 0;
    for (let i = 0; i < atoms.length; i++) {
      for (let j = i + 1; j < atoms.length; j++) {
        if (this.isTemporallyOrdered(atoms[i], atoms[j])) {
          count++;
        }
      }
    }
    return count;
  }

  private isTemporallyOrdered(a: Atom, b: Atom): boolean {
    // Check if atoms have temporal ordering
    return a.type.includes('Temporal') &&
           b.type.includes('Temporal') &&
           a.name < b.name; // Simple ordering check
  }

  private calculateRegularityScore(pattern: MinedPattern): number {
    if (!pattern.pattern.type?.includes('Periodic')) return 0;

    // Calculate periodicity strength
    const instances = pattern.instances;
    if (instances.length < 3) return 0;

    // Measure regularity of temporal intervals
    const intervals = this.calculateIntervals(instances);
    return this.calculateIntervalRegularity(intervals);
  }

  private calculateIntervals(instances: Atom[][]): number[] {
    const intervals: number[] = [];
    for (let i = 1; i < instances.length; i++) {
      const interval = this.getTemporalDistance(
        instances[i-1][0],
        instances[i][0]
      );
      if (interval !== null) {
        intervals.push(interval);
      }
    }
    return intervals;
  }

  private getTemporalDistance(a: Atom, b: Atom): number | null {
    // Simplified temporal distance calculation
    if (!a.value || !b.value) return null;
    return Math.abs(Number(b.value) - Number(a.value));
  }

  private calculateIntervalRegularity(intervals: number[]): number {
    if (intervals.length === 0) return 0;

    const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / intervals.length;
    
    return 1 / (1 + variance / Math.pow(mean, 2));
  }

  private calculateCoverageScore(pattern: MinedPattern): number {
    // Calculate temporal coverage of the pattern
    const instances = pattern.instances;
    if (instances.length === 0) return 0;

    const timeRange = this.calculateTimeRange(instances);
    const coverage = instances.length / timeRange;

    return Math.min(1, coverage);
  }

  private calculateTimeRange(instances: Atom[][]): number {
    let minTime = Infinity;
    let maxTime = -Infinity;

    instances.forEach(instance => {
      instance.forEach(atom => {
        if (atom.value) {
          const time = Number(atom.value);
          minTime = Math.min(minTime, time);
          maxTime = Math.max(maxTime, time);
        }
      });
    });

    return maxTime - minTime || 1;
  }
}