import { Atom, TruthValue } from '../../../types';
import { BasePLNRule } from '../base/base-rule';

export class TemporalOrderRule extends BasePLNRule {
  readonly name = 'TemporalOrder';
  readonly description = 'Infer temporal ordering between events';
  readonly category = 'Temporal';
  readonly computationalCost = 0.6;

  applyRule(atoms: Atom[]): Atom[] {
    if (!this.validateAtoms(atoms, 2)) return [];
    
    const [event1, event2] = atoms;
    if (!event1.truthValue || !event2.truthValue) return [];

    // Calculate temporal order confidence
    const orderTv: TruthValue = {
      strength: Math.min(event1.truthValue.strength, event2.truthValue.strength),
      confidence: Math.min(event1.truthValue.confidence, event2.truthValue.confidence) * 0.9
    };

    return [this.createResultAtom(
      `temporal-order-${event1.id}-${event2.id}`,
      'TemporalOrderLink',
      `TemporalOrder(${event1.name},${event2.name})`,
      [event1.id, event2.id],
      orderTv
    )];
  }

  validate(atoms: Atom[]): boolean {
    return super.validateAtoms(atoms, 2) &&
           atoms.every(atom => atom.truthValue !== undefined);
  }
}