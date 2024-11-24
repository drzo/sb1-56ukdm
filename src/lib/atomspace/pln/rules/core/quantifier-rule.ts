import { Atom, TruthValue } from '../../../types';
import { BasePLNRule } from '../base/base-rule';

export class QuantifierRule extends BasePLNRule {
  readonly name = 'Quantifier';
  readonly description = 'Handle universal and existential quantification';
  readonly category = 'Core';
  readonly computationalCost = 0.9;

  applyRule(atoms: Atom[]): Atom[] {
    if (!this.validateAtoms(atoms, 3)) return [];
    
    const [quantifier, variable, predicate] = atoms;
    if (!quantifier.truthValue || !variable.truthValue || !predicate.truthValue) return [];

    const isUniversal = this.isUniversalQuantifier(quantifier);
    const quantifierTv = isUniversal
      ? this.calculateUniversalQuantification(variable, predicate)
      : this.calculateExistentialQuantification(variable, predicate);

    // Create scoped variable binding
    const scopedVariable = this.createResultAtom(
      `scoped-${variable.id}`,
      'VariableNode',
      variable.name,
      [],
      variable.truthValue
    );

    // Create quantified expression
    return [this.createResultAtom(
      `quantified-${quantifier.id}-${predicate.id}`,
      isUniversal ? 'UniversalLink' : 'ExistentialLink',
      `Quantified(${variable.name},${predicate.name})`,
      [scopedVariable.id, predicate.id],
      quantifierTv
    )];
  }

  private isUniversalQuantifier(atom: Atom): boolean {
    return atom.name.startsWith('ForAll');
  }

  private calculateUniversalQuantification(variable: Atom, predicate: Atom): TruthValue {
    const coverage = variable.truthValue!.strength;
    const predicateStrength = predicate.truthValue!.strength;
    
    return {
      strength: Math.min(coverage, predicateStrength),
      confidence: Math.min(
        variable.truthValue!.confidence,
        predicate.truthValue!.confidence
      ) * coverage * 0.9
    };
  }

  private calculateExistentialQuantification(variable: Atom, predicate: Atom): TruthValue {
    const instanceLikelihood = variable.truthValue!.strength * predicate.truthValue!.strength;
    
    return {
      strength: Math.max(0.1, instanceLikelihood),
      confidence: Math.min(
        variable.truthValue!.confidence,
        predicate.truthValue!.confidence
      ) * 0.8
    };
  }

  validate(atoms: Atom[]): boolean {
    if (!super.validateAtoms(atoms, 3)) return false;
    
    const [quantifier, variable, predicate] = atoms;
    return variable.type === 'VariableNode' &&
           (quantifier.name.startsWith('ForAll') || 
            quantifier.name.startsWith('ThereExists'));
  }
}