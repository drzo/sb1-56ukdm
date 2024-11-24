import { Atom, TruthValue } from '../../../types';
import { BasePLNRule } from '../base/base-rule';

export class TemporalRelationshipRule extends BasePLNRule {
  readonly name = 'TemporalRelationship';
  readonly description = 'Infer complex temporal relationships between events';
  readonly category = 'Temporal';
  readonly computationalCost = 0.7;

  applyRule(atoms: Atom[]): Atom[] {
    if (!this.validateAtoms(atoms, 3)) return [];
    
    const [event1, event2, timeContext] = atoms;
    if (!event1.truthValue || !event2.truthValue || !timeContext.truthValue) return [];

    // Calculate temporal relationship strength
    const relationship = this.inferTemporalRelationship(event1, event2);
    const relationshipTv: TruthValue = {
      strength: relationship.strength * timeContext.truthValue.strength,
      confidence: Math.min(
        event1.truthValue.confidence,
        event2.truthValue.confidence,
        timeContext.truthValue.confidence
      ) * 0.9
    };

    return [this.createResultAtom(
      `temporal-rel-${event1.id}-${event2.id}`,
      relationship.type,
      `TemporalRelationship(${event1.name},${event2.name})`,
      [event1.id, event2.id, timeContext.id],
      relationshipTv
    )];
  }

  private inferTemporalRelationship(event1: Atom, event2: Atom): {
    type: string;
    strength: number;
  } {
    if (this.isOverlapping(event1, event2)) {
      return {
        type: 'TemporalOverlapLink',
        strength: this.calculateOverlapStrength(event1, event2)
      };
    }

    if (this.isBefore(event1, event2)) {
      return {
        type: 'TemporalBeforeLink',
        strength: this.calculateSequenceStrength(event1, event2)
      };
    }

    return {
      type: 'TemporalAfterLink',
      strength: this.calculateSequenceStrength(event2, event1)
    };
  }

  private isOverlapping(event1: Atom, event2: Atom): boolean {
    const time1 = this.getTimeValue(event1);
    const time2 = this.getTimeValue(event2);
    const duration1 = this.getDuration(event1);
    const duration2 = this.getDuration(event2);

    return Math.abs(time1 - time2) < (duration1 + duration2) / 2;
  }

  private isBefore(event1: Atom, event2: Atom): boolean {
    return this.getTimeValue(event1) < this.getTimeValue(event2);
  }

  private calculateOverlapStrength(event1: Atom, event2: Atom): number {
    const time1 = this.getTimeValue(event1);
    const time2 = this.getTimeValue(event2);
    const duration1 = this.getDuration(event1);
    const duration2 = this.getDuration(event2);

    const overlap = Math.min(
      Math.abs(time1 - time2),
      (duration1 + duration2) / 2
    );

    return overlap / Math.max(duration1, duration2);
  }

  private calculateSequenceStrength(before: Atom, after: Atom): number {
    const timeDiff = Math.abs(
      this.getTimeValue(after) - this.getTimeValue(before)
    );
    const maxDuration = Math.max(
      this.getDuration(before),
      this.getDuration(after)
    );

    return Math.exp(-timeDiff / maxDuration);
  }

  private getTimeValue(event: Atom): number {
    return event.value?.time ?? 0;
  }

  private getDuration(event: Atom): number {
    return event.value?.duration ?? 1;
  }

  validate(atoms: Atom[]): boolean {
    return super.validateAtoms(atoms, 3) &&
           atoms.every(atom => atom.truthValue !== undefined);
  }
}