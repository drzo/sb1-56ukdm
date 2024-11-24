import { Atom, TruthValue } from '../../types';
import { PLNRule } from './pln-rule';
import { calculateRevision } from '../truth-values/operations';

export class HebbianCompositionRule implements PLNRule {
  name = 'HebbianComposition';
  description = 'Compose new relationships based on Hebbian link strengths';

  apply(atoms: Atom[]): Atom[] {
    if (!this.validate(atoms)) return [];
    
    const [hebbianAB, hebbianBC] = atoms;
    if (!hebbianAB.truthValue || !hebbianBC.truthValue) return [];

    const [sourceA] = hebbianAB.outgoing || [];
    const [, targetC] = hebbianBC.outgoing || [];
    
    if (!sourceA || !targetC) return [];

    // Calculate composition strength based on Hebbian links
    const compositionTv: TruthValue = {
      strength: Math.min(
        hebbianAB.truthValue.strength,
        hebbianBC.truthValue.strength
      ),
      confidence: hebbianAB.truthValue.confidence * 
                 hebbianBC.truthValue.confidence * 0.8
    };

    return [{
      id: `${sourceA}-heb-comp-${targetC}`,
      type: 'HebbianLink',
      name: `HebbianComposition(${sourceA},${targetC})`,
      outgoing: [sourceA, targetC],
      truthValue: compositionTv
    }];
  }

  validate(atoms: Atom[]): boolean {
    return atoms.length === 2 && 
           atoms.every(atom => 
             atom.type === 'HebbianLink' &&
             atom.truthValue !== undefined &&
             atom.outgoing?.length === 2
           );
  }
}