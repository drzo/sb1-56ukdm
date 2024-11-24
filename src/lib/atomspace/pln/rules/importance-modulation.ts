import { Atom, TruthValue } from '../../types';
import { PLNRule } from './pln-rule';
import { calculateRevision } from '../truth-values/operations';

export class ImportanceModulationRule implements PLNRule {
  name = 'ImportanceModulation';
  description = 'Modulate inference strength based on importance levels';

  apply(atoms: Atom[]): Atom[] {
    if (!this.validate(atoms)) return [];
    
    const [inference, context] = atoms;
    if (!inference.truthValue || !context.attention) return [];

    // Modulate inference based on context importance
    const importanceFactor = (context.attention.sti + 100) / 200; // Normalize to [0,1]
    
    const modulatedTv: TruthValue = {
      strength: inference.truthValue.strength * 
                (0.8 + 0.2 * importanceFactor),
      confidence: inference.truthValue.confidence * importanceFactor
    };

    return [{
      id: `${inference.id}-mod-${context.id}`,
      type: inference.type,
      name: `ImportanceModulated(${inference.name})`,
      outgoing: inference.outgoing,
      truthValue: modulatedTv,
      attention: inference.attention
    }];
  }

  validate(atoms: Atom[]): boolean {
    return atoms.length === 2 && 
           atoms[0].truthValue !== undefined &&
           atoms[1].attention !== undefined;
  }
}