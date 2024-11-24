import { Atom, TruthValue } from '../../../types';
import { BasePLNRule } from '../base/base-rule';

export class TemporalPatternRule extends BasePLNRule {
  readonly name = 'TemporalPattern';
  readonly description = 'Recognize and reason about temporal patterns';
  readonly category = 'Temporal';
  readonly computationalCost = 0.8;

  applyRule(atoms: Atom[]): Atom[] {
    if (!this.validateAtoms(atoms, 3)) return [];
    
    const [sequence, pattern, timeContext] = atoms;
    if (!sequence.truthValue || !pattern.truthValue || !timeContext.truthValue) return [];

    // Analyze temporal pattern
    const patternTv = this.analyzeTemporalPattern(sequence, pattern, timeContext);
    
    return [this.createResultAtom(
      `temporal-pattern-${sequence.id}-${pattern.id}`,
      'TemporalPatternLink',
      `TemporalPattern(${sequence.name},${pattern.name})`,
      [sequence.id, pattern.id, timeContext.id],
      patternTv
    )];
  }

  private analyzeTemporalPattern(
    sequence: Atom,
    pattern: Atom,
    timeContext: Atom
  ): TruthValue {
    const patternStrength = this.calculatePatternStrength(
      sequence,
      pattern,
      timeContext
    );

    const patternConfidence = this.calculatePatternConfidence(
      sequence,
      pattern,
      timeContext
    );

    return {
      strength: patternStrength,
      confidence: patternConfidence
    };
  }

  private calculatePatternStrength(
    sequence: Atom,
    pattern: Atom,
    timeContext: Atom
  ): number {
    const matchScore = this.calculatePatternMatch(sequence, pattern);
    const temporalConsistency = this.calculateTemporalConsistency(
      sequence,
      timeContext
    );

    return matchScore * temporalConsistency * timeContext.truthValue!.strength;
  }

  private calculatePatternMatch(sequence: Atom, pattern: Atom): number {
    const sequenceEvents = this.getTemporalEvents(sequence);
    const patternEvents = this.getTemporalEvents(pattern);

    if (sequenceEvents.length === 0 || patternEvents.length === 0) {
      return 0;
    }

    const matches = this.countPatternMatches(sequenceEvents, patternEvents);
    return matches / Math.max(sequenceEvents.length, patternEvents.length);
  }

  private calculateTemporalConsistency(
    sequence: Atom,
    timeContext: Atom
  ): number {
    const events = this.getTemporalEvents(sequence);
    if (events.length < 2) return 1;

    const intervals = this.calculateIntervals(events);
    return this.calculateIntervalRegularity(intervals);
  }

  private getTemporalEvents(atom: Atom): any[] {
    return atom.value?.events ?? [];
  }

  private countPatternMatches(
    sequence: any[],
    pattern: any[]
  ): number {
    let matches = 0;
    for (let i = 0; i <= sequence.length - pattern.length; i++) {
      if (this.isPatternMatch(sequence.slice(i, i + pattern.length), pattern)) {
        matches++;
      }
    }
    return matches;
  }

  private isPatternMatch(subsequence: any[], pattern: any[]): boolean {
    return subsequence.every((event, index) =>
      this.matchesPatternEvent(event, pattern[index])
    );
  }

  private matchesPatternEvent(event: any, patternEvent: any): boolean {
    return event.type === patternEvent.type &&
           Math.abs(event.time - patternEvent.time) < patternEvent.tolerance;
  }

  private calculateIntervals(events: any[]): number[] {
    const intervals: number[] = [];
    for (let i = 1; i < events.length; i++) {
      intervals.push(Math.abs(events[i].time - events[i-1].time));
    }
    return intervals;
  }

  private calculateIntervalRegularity(intervals: number[]): number {
    if (intervals.length === 0) return 1;

    const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce(
      (a, b) => a + Math.pow(b - mean, 2),
      0
    ) / intervals.length;

    return 1 / (1 + variance / Math.pow(mean, 2));
  }

  private calculatePatternConfidence(
    sequence: Atom,
    pattern: Atom,
    timeContext: Atom
  ): number {
    const events = this.getTemporalEvents(sequence);
    const patternEvents = this.getTemporalEvents(pattern);

    const coverageFactor = Math.min(1, events.length / patternEvents.length);

    return Math.min(
      sequence.truthValue!.confidence,
      pattern.truthValue!.confidence,
      timeContext.truthValue!.confidence
    ) * coverageFactor * 0.9;
  }

  validate(atoms: Atom[]): boolean {
    return super.validateAtoms(atoms, 3) &&
           atoms.every(atom => atom.truthValue !== undefined);
  }
}