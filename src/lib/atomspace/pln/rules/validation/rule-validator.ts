import { Atom, TruthValue } from '../../../types';
import { validateTruthValue } from '../../truth-values/validation';

export class PLNRuleValidator {
  static validateAtomCount(atoms: Atom[], required: number): boolean {
    return atoms.length === required;
  }

  static validateTruthValues(atoms: Atom[]): boolean {
    return atoms.every(atom => 
      atom.truthValue && validateTruthValue(atom.truthValue)
    );
  }

  static validateAttentionValues(atoms: Atom[]): boolean {
    return atoms.every(atom => atom.attention !== undefined);
  }

  static validateTypes(atoms: Atom[], types: string[]): boolean {
    return atoms.every((atom, i) => atom.type === types[i]);
  }

  static validateLinks(atoms: Atom[], linkPattern: string[][]): boolean {
    return linkPattern.every((pattern, i) => {
      const atom = atoms[i];
      return pattern.every(targetId => 
        atom.outgoing?.includes(targetId)
      );
    });
  }

  static validateContext(context: Atom): boolean {
    return context.truthValue !== undefined && 
           context.attention !== undefined;
  }
}