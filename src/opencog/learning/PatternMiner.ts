import { Atom } from '../../types/Atom';
import { Link } from '../../types/Link';
import { Logger } from '../../cogutil/Logger';
import { Statistics } from '../../cogutil/Statistics';
import { Timer } from '../../cogutil/Timer';

interface Pattern {
  atoms: Atom[];
  frequency: number;
  significance: number;
}

export class PatternMiner {
  private minSupport: number;
  private maxPatternSize: number;
  private patterns: Map<string, Pattern>;

  constructor(minSupport: number = 2, maxPatternSize: number = 5) {
    this.minSupport = minSupport;
    this.maxPatternSize = maxPatternSize;
    this.patterns = new Map();
    Logger.info('PatternMiner initialized');
  }

  async minePatterns(atoms: Atom[]): Promise<Pattern[]> {
    const timer = new Timer();
    try {
      // Find frequent patterns of increasing size
      for (let size = 1; size <= this.maxPatternSize; size++) {
        const candidates = this.generateCandidates(atoms, size);
        const frequent = this.findFrequentPatterns(candidates);
        this.updatePatterns(frequent);
      }

      // Calculate pattern significance
      this.calculateSignificance();

      const results = Array.from(this.patterns.values())
        .sort((a, b) => b.significance - a.significance);

      Logger.info(`Mined ${results.length} patterns in ${timer.stop()}ms`);
      return results;
    } catch (error) {
      Logger.error('Pattern mining failed:', error);
      throw error;
    }
  }

  private generateCandidates(atoms: Atom[], size: number): Atom[][] {
    const candidates: Atom[][] = [];
    
    const generate = (current: Atom[], start: number) => {
      if (current.length === size) {
        candidates.push([...current]);
        return;
      }

      for (let i = start; i < atoms.length; i++) {
        current.push(atoms[i]);
        generate(current, i + 1);
        current.pop();
      }
    };

    generate([], 0);
    return candidates;
  }

  private findFrequentPatterns(candidates: Atom[][]): Pattern[] {
    return candidates
      .map(atoms => {
        const frequency = this.countOccurrences(atoms);
        return {
          atoms,
          frequency,
          significance: 0 // Calculated later
        };
      })
      .filter(pattern => pattern.frequency >= this.minSupport);
  }

  private countOccurrences(pattern: Atom[]): number {
    // Simplified occurrence counting
    // In practice, this would use more sophisticated graph matching
    return pattern.reduce((count, atom) => {
      if (atom instanceof Link) {
        return Math.min(count, atom.getOutgoingSet().length);
      }
      return count;
    }, Number.MAX_SAFE_INTEGER);
  }

  private updatePatterns(newPatterns: Pattern[]): void {
    for (const pattern of newPatterns) {
      const key = this.patternToString(pattern.atoms);
      this.patterns.set(key, pattern);
    }
  }

  private calculateSignificance(): void {
    const frequencies = Array.from(this.patterns.values())
      .map(p => p.frequency);
    
    const mean = Statistics.mean(frequencies);
    const stdDev = Statistics.standardDeviation(frequencies);

    for (const pattern of this.patterns.values()) {
      pattern.significance = (pattern.frequency - mean) / stdDev;
    }
  }

  private patternToString(atoms: Atom[]): string {
    return atoms.map(a => a.getId()).sort().join(',');
  }

  getTopPatterns(limit: number = 10): Pattern[] {
    return Array.from(this.patterns.values())
      .sort((a, b) => b.significance - a.significance)
      .slice(0, limit);
  }

  getPatternStats(): {
    totalPatterns: number;
    averageFrequency: number;
    maxSignificance: number;
  } {
    const patterns = Array.from(this.patterns.values());
    return {
      totalPatterns: patterns.length,
      averageFrequency: Statistics.mean(patterns.map(p => p.frequency)),
      maxSignificance: Math.max(...patterns.map(p => p.significance))
    };
  }
}