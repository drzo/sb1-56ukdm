import { Atom, TruthValue } from '../../../types';
import { BasePLNRule } from '../base/base-rule';

export class ContextualSpecializationRule extends BasePLNRule {
  readonly name = 'ContextualSpecialization';
  readonly description = 'Specialize concepts based on context';
  readonly category = 'Contextual';
  readonly computationalCost = 0.7;

  applyRule(atoms: Atom[]): Atom[] {
    if (!this.validateAtoms(atoms, 2)) return [];
    
    const [concept, context] = atoms;
    if (!concept.truthValue || !context.truthValue) return [];

    // Calculate specialization strength
    const specializationTv: TruthValue = {
      strength: concept.truthValue.strength * context.truthValue.strength,
      confidence: Math.min(
        concept.truthValue.confidence,
        context.truthValue.confidence
      ) * 0.85
    };

    return [this.createResultAtom(
      `ctx-spec-${concept.id}-${context.id}`,
      'ContextualSpecializationLink',
      `ContextualSpecialization(${concept.name})`,
      [concept.id, context.id],
      specializationTv
    )];
  }

  validate(atoms: Atom[]): boolean {
    return super.validateAtoms(atoms, 2) &&
           atoms.every(atom => atom.truthValue !== undefined);
  }
}