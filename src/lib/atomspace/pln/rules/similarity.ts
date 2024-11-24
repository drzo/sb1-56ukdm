import { Atom, TruthValue } from '../../types';
import { PLNRule } from './pln-rule';
import { calculateIntersection, calculateUnion } from '../truth-values/operations';

export class SimilarityRule implements PLNRule {
  name = 'Similarity';
  description = 'Compute similarity between two concepts based on their truth values';

  apply(atoms: Atom[]): Atom[] {
    if (!this.validate(atoms)) return [];
    
    const [A, B] = atoms;
    if (!A.truthValue || !B.truthValue) return [];

    const intersection = calculateIntersection(A.truthValue, B.truthValue);
    const union = calculateUnion(A.truthValue, B.truthValue);
    
    const similarityTv: TruthValue = {
      strength: intersection.strength / union.strength,
      confidence: Math.min(intersection.confidence, union.confidence)
    };

    return [{
      id: `${A.id}~${B.id}`,
      type: 'SimilarityLink',
      name: `Similarity(${A.name},${B.name})`,
      outgoing: [A.id, B.id],
      truthValue: similarityTv
    }];
  }

  validate(atoms: Atom[]): boolean {
    return atoms.length === 2 && 
           atoms.every(atom => atom.truthValue !== undefined);
  }
}