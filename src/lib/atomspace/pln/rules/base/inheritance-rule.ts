import { Atom, TruthValue } from '../../../types';
import { BasePLNRule } from './base-rule';
import { calculateInduction } from '../../truth-values/operations';

export abstract class InheritancePLNRule extends BasePLNRule {
  readonly category = 'Inheritance';

  protected calculateInheritanceStrength(
    subclass: TruthValue,
    superclass: TruthValue,
    attentionFactor: number = 1
  ): TruthValue {
    const baseTv = calculateInduction(subclass, superclass);
    
    return {
      strength: baseTv.strength * (0.7 + 0.3 * attentionFactor),
      confidence: baseTv.confidence * attentionFactor
    };
  }

  protected validateInheritanceRelation(atoms: Atom[]): boolean {
    if (!this.validateAtoms(atoms, 2)) return false;
    
    const [sub, sup] = atoms;
    return sub.type === sup.type;
  }
}