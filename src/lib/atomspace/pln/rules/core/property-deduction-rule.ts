import { Atom, TruthValue } from '../../../types';
import { BasePLNRule } from '../base/base-rule';

export class PropertyDeductionRule extends BasePLNRule {
  readonly name = 'PropertyDeduction';
  readonly description = 'Deduce properties through inheritance chains';
  readonly category = 'Core';
  readonly computationalCost = 0.5;

  applyRule(atoms: Atom[]): Atom[] {
    if (!this.validateAtoms(atoms, 3)) return [];
    
    const [instance, class1, property] = atoms;
    if (!instance.truthValue || !class1.truthValue || !property.truthValue) return [];

    // Calculate property inheritance strength
    const inheritanceStrength = instance.truthValue.strength * class1.truthValue.strength;
    const propertyStrength = property.truthValue.strength;

    const deductionTv: TruthValue = {
      strength: inheritanceStrength * propertyStrength,
      confidence: instance.truthValue.confidence * 
                 class1.truthValue.confidence * 
                 property.truthValue.confidence * 0.8
    };

    return [this.createResultAtom(
      `property-deduction-${instance.id}-${property.id}`,
      'EvaluationLink',
      `PropertyDeduction(${instance.name},${property.name})`,
      [instance.id, property.id],
      deductionTv
    )];
  }

  validate(atoms: Atom[]): boolean {
    return super.validateAtoms(atoms, 3) &&
           atoms.every(atom => atom.truthValue !== undefined);
  }
}