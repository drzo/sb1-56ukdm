import { Atom, TruthValue } from '../../../types';
import { BasePLNRule } from '../base/base-rule';

export class ContrapositionRule extends BasePLNRule {
  readonly name = 'Contraposition';
  readonly description = 'If A implies B, then not-B implies not-A';
  readonly category = 'Core';
  readonly computationalCost = 0.5;

  applyRule(atoms: Atom[]): Atom[] {
    if (!this.validateAtoms(atoms, 1)) return [];
    
    const [implication] = atoms;
    if (!implication.truthValue || !implication.outgoing) return [];

    const [A, B] = implication.outgoing;

    // Create NOT links for A and B
    const notB = this.createResultAtom(
      `not-${B}`,
      'NotLink',
      `Not(${B})`,
      [B],
      { strength: 1 - implication.truthValue.strength, confidence: implication.truthValue.confidence }
    );

    const notA = this.createResultAtom(
      `not-${A}`,
      'NotLink',
      `Not(${A})`,
      [A],
      { strength: 1 - implication.truthValue.strength, confidence: implication.truthValue.confidence }
    );

    // Create contrapositive implication
    return [this.createResultAtom(
      `contra-${notB.id}-${notA.id}`,
      'ImplicationLink',
      `Contraposition(${notB.name},${notA.name})`,
      [notB.id, notA.id],
      implication.truthValue
    )];
  }

  validate(atoms: Atom[]): boolean {
    if (!super.validateAtoms(atoms, 1)) return false;
    
    const [implication] = atoms;
    return implication.type === 'ImplicationLink' &&
           implication.outgoing?.length === 2;
  }
}