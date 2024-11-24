import { Atom, TruthValue } from '../../../types';
import { PLNRule } from '../pln-rule';

export class SimilaritySymmetryRule implements PLNRule {
  name = 'SimilaritySymmetry';
  description = 'If A is similar to B, then B is similar to A';

  apply(atoms: Atom[]): Atom[] {
    if (!this.validate(atoms)) return [];
    
    const similarity = atoms[0];
    if (similarity.type !== 'SimilarityLink' || !similarity.truthValue) return [];
    
    const [A, B] = similarity.outgoing || [];
    if (!A || !B) return [];

    return [{
      id: `${B}~${A}`,
      type: 'SimilarityLink',
      name: `Similarity(${B},${A})`,
      outgoing: [B, A],
      truthValue: similarity.truthValue
    }];
  }

  validate(atoms: Atom[]): boolean {
    return atoms.length === 1 && 
           atoms[0].type === 'SimilarityLink' &&
           atoms[0].truthValue !== undefined &&
           atoms[0].outgoing?.length === 2;
  }
}