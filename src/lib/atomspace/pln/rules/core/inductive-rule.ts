import { Atom, TruthValue } from '../../../types';
import { BasePLNRule } from '../base/base-rule';

export class InductiveRule extends BasePLNRule {
  readonly name = 'Induction';
  readonly description = 'Infer general patterns from specific instances';
  readonly category = 'Core';
  readonly computationalCost = 0.7;

  applyRule(atoms: Atom[]): Atom[] {
    if (!this.validateAtoms(atoms, 2)) return [];
    
    const [specific, general] = atoms;
    if (!specific.truthValue || !general.truthValue) return [];

    // Calculate inductive strength using weighted average
    const strength = (specific.truthValue.strength * specific.truthValue.confidence +
                     general.truthValue.strength * general.truthValue.confidence) /
                    (specific.truthValue.confidence + general.truthValue.confidence);
    
    const confidence = Math.min(
      specific.truthValue.confidence,
      general.truthValue.confidence
    ) * 0.8;

    const inductiveTv: TruthValue = {
      strength: Math.min(1, Math.max(0, strength)),
      confidence: Math.min(1, Math.max(0, confidence))
    };

    return [this.createResultAtom(
      `induction-${specific.id}-${general.id}`,
      'InductiveLink',
      `Induction(${specific.name},${general.name})`,
      [specific.id, general.id],
      inductiveTv
    )];
  }

  validate(atoms: Atom[]): boolean {
    return super.validateAtoms(atoms, 2) &&
           atoms.every(atom => atom.truthValue !== undefined);
  }
}