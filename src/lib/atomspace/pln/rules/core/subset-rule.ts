import { Atom, TruthValue } from '../../../types';
import { BasePLNRule } from '../base/base-rule';

export class SubsetRule extends BasePLNRule {
  readonly name = 'Subset';
  readonly description = 'Evaluate subset relationships between concepts';
  readonly category = 'Core';
  readonly computationalCost = 0.4;

  applyRule(atoms: Atom[]): Atom[] {
    if (!this.validateAtoms(atoms, 2)) return [];
    
    const [A, B] = atoms;
    if (!A.truthValue || !B.truthValue) return [];

    const subsetTv: TruthValue = {
      strength: Math.min(1, A.truthValue.strength / Math.max(0.0001, B.truthValue.strength)),
      confidence: A.truthValue.confidence * B.truthValue.confidence * 0.9
    };

    return [this.createResultAtom(
      `subset-${A.id}-${B.id}`,
      'SubsetLink',
      `Subset(${A.name},${B.name})`,
      [A.id, B.id],
      subsetTv
    )];
  }

  validate(atoms: Atom[]): boolean {
    return super.validateAtoms(atoms, 2) &&
           atoms[1].truthValue!.strength > 0;
  }
}