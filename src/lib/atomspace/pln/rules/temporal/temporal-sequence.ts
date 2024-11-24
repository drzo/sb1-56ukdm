import { Atom, TruthValue } from '../../../types';
import { BasePLNRule } from '../base/base-rule';

export class TemporalSequenceRule extends BasePLNRule {
  readonly name = 'TemporalSequence';
  readonly description = 'Infer sequential relationships between temporally ordered events';
  readonly category = 'Temporal';
  readonly computationalCost = 0.6;

  applyRule(atoms: Atom[]): Atom[] {
    if (!this.validateAtoms(atoms, 2)) return [];
    
    const [A, B] = atoms;
    if (!A.truthValue || !B.truthValue) return [];

    // Calculate temporal relationship strength
    const sequenceTv: TruthValue = {
      strength: Math.min(A.truthValue.strength, B.truthValue.strength),
      confidence: Math.min(A.truthValue.confidence, B.truthValue.confidence) * 0.9
    };

    return [this.createResultAtom(
      `temp-seq-${A.id}-${B.id}`,
      'TemporalSequenceLink',
      `TemporalSequence(${A.name},${B.name})`,
      [A.id, B.id],
      sequenceTv
    )];
  }

  validate(atoms: Atom[]): boolean {
    return super.validateAtoms(atoms, 2) &&
           atoms.every(atom => atom.truthValue !== undefined);
  }
}