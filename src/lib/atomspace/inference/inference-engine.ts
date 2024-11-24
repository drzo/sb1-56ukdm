import { Atom, TruthValue } from '../../types';
import * as PLNRules from './pln-rules';

export class InferenceEngine {
  private rules: PLNRules.PLNRule[];
  private atomSpace: Map<string, Atom>;
  private inferenceThreshold: number;

  constructor(
    atomSpace: Map<string, Atom>,
    inferenceThreshold: number = 0.3
  ) {
    this.atomSpace = atomSpace;
    this.inferenceThreshold = inferenceThreshold;
    this.rules = Object.values(PLNRules);
  }

  private isSignificant(tv: TruthValue): boolean {
    return tv.strength * tv.confidence > this.inferenceThreshold;
  }

  private findCandidates(rule: PLNRules.PLNRule): Atom[][] {
    // Implementation would depend on specific rule requirements
    // This is a simplified example
    return Array.from(this.atomSpace.values())
      .filter(atom => atom.truthValue && this.isSignificant(atom.truthValue))
      .reduce<Atom[][]>((acc, atom) => {
        const combinations = this.findCompatibleAtoms(atom);
        return [...acc, ...combinations];
      }, []);
  }

  private findCompatibleAtoms(atom: Atom): Atom[][] {
    // Implementation would find atoms that could potentially form valid inference patterns
    // This is a simplified example
    return Array.from(this.atomSpace.values())
      .filter(other => other.id !== atom.id && other.truthValue)
      .map(other => [atom, other]);
  }

  applyRule(rule: PLNRules.PLNRule, atoms: Atom[]): Atom[] {
    return rule.apply(atoms);
  }

  inferenceStep(): Atom[] {
    const newInferences: Atom[] = [];

    for (const rule of this.rules) {
      const candidates = this.findCandidates(rule);
      
      for (const candidateAtoms of candidates) {
        const inferences = this.applyRule(rule, candidateAtoms);
        
        for (const inference of inferences) {
          if (inference.truthValue && this.isSignificant(inference.truthValue)) {
            newInferences.push(inference);
          }
        }
      }
    }

    return newInferences;
  }

  runInference(maxSteps: number = 100): Atom[] {
    let allInferences: Atom[] = [];
    let step = 0;
    let newInferences: Atom[] = [];

    do {
      newInferences = this.inferenceStep();
      allInferences = [...allInferences, ...newInferences];
      
      // Add new inferences to atom space for next iteration
      newInferences.forEach(atom => {
        this.atomSpace.set(atom.id, atom);
      });

      step++;
    } while (newInferences.length > 0 && step < maxSteps);

    return allInferences;
  }

  explainInference(inference: Atom): string {
    // Implementation would provide a human-readable explanation of how the inference was derived
    // This is a simplified example
    return `Inference ${inference.name} (${inference.type}) with truth value: ` +
           `strength=${inference.truthValue?.strength.toFixed(2)}, ` +
           `confidence=${inference.truthValue?.confidence.toFixed(2)}`;
  }
}