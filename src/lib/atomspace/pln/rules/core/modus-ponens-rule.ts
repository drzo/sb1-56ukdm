import { Atom, TruthValue } from '../../../types';
import { BasePLNRule } from '../base/base-rule';

export class ModusPonensRule extends BasePLNRule {
  readonly name = 'ModusPonens';
  readonly description = 'If A is true and A implies B, then B is true';
  readonly category = 'Core';
  readonly computationalCost = 0.2;

  applyRule(atoms: Atom[]): Atom[] {
    if (!this.validateAtoms(atoms, 2)) return [];
    
    const [premise, implication] = atoms;
    if (!premise.truthValue || !implication.truthValue) return [];

    // Extract conclusion from implication
    const [, conclusion] = implication.outgoing || [];
    if (!conclusion) return [];

    // Calculate conclusion truth value
    const strength = premise.truthValue.strength * implication.truthValue.strength;
    const confidence = premise.truthValue.confidence * implication.truthValue.confidence;

    const conclusionTv: TruthValue = {
      strength: Math.min(1, Math.max(0, strength)),
      confidence: Math.min(1, Math.max(0, confidence))
    };

    return [this.createResultAtom(
      `modus-ponens-${premise.id}-${conclusion}`,
      'EvaluationLink',
      `ModusPonens(${premise.name})`,
      [conclusion],
      conclusionTv
    )];
  }

  validate(atoms: Atom[]): boolean {
    if (!super.validateAtoms(atoms, 2)) return false;
    
    const [premise, implication] = atoms;
    return implication.type === 'ImplicationLink' &&
           implication.outgoing?.length === 2 &&
           implication.outgoing[0] === premise.id;
  }
}