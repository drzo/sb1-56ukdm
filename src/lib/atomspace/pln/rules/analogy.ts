import { Atom, TruthValue } from '../../types/atom';
import { PLNRule } from './pln-rule';

export class AnalogyRule implements PLNRule {
  name = 'Analogy';
  description = 'Infer relationships through analogical reasoning';

  apply(atoms: Atom[]): Atom[] {
    if (!this.validate(atoms)) return [];
    
    const [A1, B1, A2, B2] = atoms;
    if (!A1.truthValue || !B1.truthValue || !A2.truthValue || !B2.truthValue) return [];

    // Calculate similarity between relationships
    const rel1Strength = Math.abs(A1.truthValue.strength - B1.truthValue.strength);
    const rel2Strength = Math.abs(A2.truthValue.strength - B2.truthValue.strength);
    
    const tv: TruthValue = {
      strength: 1 - Math.abs(rel1Strength - rel2Strength),
      confidence: Math.min(
        A1.truthValue.confidence,
        B1.truthValue.confidence,
        A2.truthValue.confidence,
        B2.truthValue.confidence
      ) * 0.8
    };

    return [{
      id: `analogy-${A1.id}${B1.id}-${A2.id}${B2.id}`,
      type: 'AnalogyLink',
      name: `Analogy((${A1.name},${B1.name}),(${A2.name},${B2.name}))`,
      outgoing: [A1.id, B1.id, A2.id, B2.id],
      truthValue: tv
    }];
  }

  validate(atoms: Atom[]): boolean {
    return atoms.length === 4 && 
           atoms.every(atom => atom.truthValue !== undefined);
  }
}