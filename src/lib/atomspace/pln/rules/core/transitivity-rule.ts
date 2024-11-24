import { Atom, TruthValue } from '../../../types';
import { BasePLNRule } from '../base/base-rule';

export class TransitivityRule extends BasePLNRule {
  readonly name = 'Transitivity';
  readonly description = 'If A is related to B and B to C, then A is related to C';
  readonly category = 'Core';
  readonly computationalCost = 0.4;

  applyRule(atoms: Atom[]): Atom[] {
    if (!this.validateAtoms(atoms, 2)) return [];
    
    const [rel1, rel2] = atoms;
    if (!rel1.truthValue || !rel2.truthValue) return [];
    if (!rel1.outgoing || !rel2.outgoing) return [];

    const [A, B1] = rel1.outgoing;
    const [B2, C] = rel2.outgoing;
    if (B1 !== B2) return [];

    const transitiveTv: TruthValue = {
      strength: Math.min(rel1.truthValue.strength, rel2.truthValue.strength),
      confidence: rel1.truthValue.confidence * rel2.truthValue.confidence * 0.9
    };

    return [this.createResultAtom(
      `trans-${A}-${C}`,
      rel1.type,
      `Transitivity(${A},${C})`,
      [A, C],
      transitiveTv
    )];
  }

  validate(atoms: Atom[]): boolean {
    if (!super.validateAtoms(atoms, 2)) return false;
    
    const [rel1, rel2] = atoms;
    return rel1.type === rel2.type &&
           ['InheritanceLink', 'SimilarityLink', 'ImplicationLink'].includes(rel1.type) &&
           rel1.outgoing?.length === 2 &&
           rel2.outgoing?.length === 2;
  }
}