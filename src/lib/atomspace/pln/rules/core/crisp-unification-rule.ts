import { Atom, TruthValue } from '../../../types';
import { BasePLNRule } from '../base/base-rule';

export class CrispUnificationRule extends BasePLNRule {
  readonly name = 'CrispUnification';
  readonly description = 'Unify patterns with exact matching criteria';
  readonly category = 'Core';
  readonly computationalCost = 0.5;

  applyRule(atoms: Atom[]): Atom[] {
    if (!this.validateAtoms(atoms, 2)) return [];
    
    const [pattern1, pattern2] = atoms;
    if (!pattern1.truthValue || !pattern2.truthValue) return [];

    // Calculate unification strength - requires exact match
    const isMatch = this.patternsMatch(pattern1, pattern2);
    if (!isMatch) return [];

    const unificationTv: TruthValue = {
      strength: 1.0, // Crisp matching is binary
      confidence: Math.min(
        pattern1.truthValue.confidence,
        pattern2.truthValue.confidence
      )
    };

    return [this.createResultAtom(
      `unification-${pattern1.id}-${pattern2.id}`,
      'UnificationLink',
      `Unification(${pattern1.name},${pattern2.name})`,
      [pattern1.id, pattern2.id],
      unificationTv
    )];
  }

  private patternsMatch(a: Atom, b: Atom): boolean {
    return a.type === b.type &&
           a.name === b.name &&
           this.outgoingMatch(a.outgoing, b.outgoing);
  }

  private outgoingMatch(a?: string[], b?: string[]): boolean {
    if (!a || !b) return a === b;
    if (a.length !== b.length) return false;
    return a.every((id, i) => id === b[i]);
  }

  validate(atoms: Atom[]): boolean {
    return super.validateAtoms(atoms, 2) &&
           atoms.every(atom => atom.truthValue !== undefined);
  }
}