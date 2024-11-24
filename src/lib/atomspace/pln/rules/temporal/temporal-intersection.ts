import { Atom, TruthValue } from '../../../types';
import { BasePLNRule } from '../base/base-rule';

export class TemporalIntersectionRule extends BasePLNRule {
  readonly name = 'TemporalIntersection';
  readonly description = 'Find temporal overlap between events';
  readonly category = 'Temporal';
  readonly computationalCost = 0.7;

  applyRule(atoms: Atom[]): Atom[] {
    if (!this.validateAtoms(atoms, 2)) return [];
    
    const [event1, event2] = atoms;
    if (!event1.truthValue || !event2.truthValue) return [];

    // Calculate intersection confidence
    const intersectionTv: TruthValue = {
      strength: Math.min(
        event1.truthValue.strength,
        event2.truthValue.strength
      ),
      confidence: Math.min(
        event1.truthValue.confidence,
        event2.truthValue.confidence
      ) * 0.8
    };

    return [this.createResultAtom(
      `temporal-intersection-${event1.id}-${event2.id}`,
      'TemporalIntersectionLink',
      `TemporalIntersection(${event1.name},${event2.name})`,
      [event1.id, event2.id],
      intersectionTv
    )];
  }

  validate(atoms: Atom[]): boolean {
    return super.validateAtoms(atoms, 2) &&
           atoms.every(atom => atom.truthValue !== undefined);
  }
}