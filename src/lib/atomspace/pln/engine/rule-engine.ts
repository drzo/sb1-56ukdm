import { Atom } from '../../types';
import { PLNRule } from '../rules/pln-rule';
import { AttentionBank } from '../../attention/attention-bank';
import { defaultRules } from '../rules';

export class PLNRuleEngine {
  private rules: PLNRule[] = [...defaultRules];
  private atomSpace: Map<string, Atom>;
  private attentionBank: AttentionBank;
  private inferenceThreshold: number;

  constructor(
    atomSpace: Map<string, Atom>,
    attentionBank: AttentionBank,
    inferenceThreshold: number = 0.3
  ) {
    this.atomSpace = atomSpace;
    this.attentionBank = attentionBank;
    this.inferenceThreshold = inferenceThreshold;
  }

  registerRule(rule: PLNRule): void {
    this.rules.push(rule);
  }

  findCandidates(rule: PLNRule): Atom[][] {
    const candidates: Atom[][] = [];
    const atoms = Array.from(this.atomSpace.values())
      .filter(atom => {
        const av = this.attentionBank.getAttentionValue(atom.id);
        return av && av.sti > 0;
      });

    // Generate combinations based on rule requirements
    const requiredAtoms = rule.validate.length;
    this.generateCombinations(atoms, requiredAtoms).forEach(combination => {
      if (rule.validate(combination)) {
        candidates.push(combination);
      }
    });

    return candidates;
  }

  private generateCombinations(atoms: Atom[], size: number): Atom[][] {
    if (size === 1) return atoms.map(atom => [atom]);
    
    const combinations: Atom[][] = [];
    for (let i = 0; i < atoms.length - size + 1; i++) {
      const head = atoms[i];
      const tailCombinations = this.generateCombinations(
        atoms.slice(i + 1),
        size - 1
      );
      tailCombinations.forEach(tail => {
        combinations.push([head, ...tail]);
      });
    }
    return combinations;
  }

  step(): Atom[] {
    const newInferences: Atom[] = [];

    for (const rule of this.rules) {
      const candidates = this.findCandidates(rule);
      
      for (const atoms of candidates) {
        const inferences = rule.apply(atoms);
        
        inferences.forEach(inference => {
          if (inference.truthValue && 
              inference.truthValue.strength * inference.truthValue.confidence > 
              this.inferenceThreshold) {
            newInferences.push(inference);

            // Update attention values for involved atoms
            atoms.forEach(atom => {
              const av = this.attentionBank.getAttentionValue(atom.id);
              if (av) {
                this.attentionBank.stimulateAtom(atom.id, 1);
              }
            });
          }
        });
      }
    }

    // Add new inferences to atom space and attention bank
    newInferences.forEach(atom => {
      this.atomSpace.set(atom.id, atom);
      if (atom.attention) {
        this.attentionBank.updateAttentionValue(atom, atom.attention);
      }
    });

    return newInferences;
  }

  run(maxSteps: number = 100): Atom[] {
    let allInferences: Atom[] = [];
    let step = 0;
    let newInferences: Atom[] = [];

    do {
      newInferences = this.step();
      allInferences = [...allInferences, ...newInferences];
      
      // Decay attention values
      this.attentionBank.decayAttentionValues(0.95);
      
      step++;
    } while (newInferences.length > 0 && step < maxSteps);

    return allInferences;
  }
}