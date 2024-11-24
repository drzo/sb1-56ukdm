import { Atom, TruthValue } from '../../types';
import { PLNRule } from './pln-rule';

export class ImportanceUpdatingRule implements PLNRule {
  name = 'ImportanceUpdating';
  description = 'Update atom importance based on usage and truth values';

  apply(atoms: Atom[]): Atom[] {
    if (!this.validate(atoms)) return [];
    
    const [atom] = atoms;
    if (!atom.attention || !atom.truthValue) return [];

    // Calculate new STI based on truth value and current importance
    const truthBonus = atom.truthValue.strength * atom.truthValue.confidence * 10;
    const newSti = Math.min(100, atom.attention.sti + truthBonus);

    // Calculate LTI increase based on STI level and usage
    const ltiIncrease = atom.attention.sti > 50 ? 1 : 0;
    const newLti = Math.min(100, atom.attention.lti + ltiIncrease);

    // Determine VLTI based on LTI threshold
    const newVlti = newLti > 80;

    return [{
      ...atom,
      attention: {
        sti: newSti,
        lti: newLti,
        vlti: newVlti
      }
    }];
  }

  validate(atoms: Atom[]): boolean {
    return atoms.length === 1 && 
           atoms[0].attention !== undefined &&
           atoms[0].truthValue !== undefined;
  }
}