import { Atom, Pattern, QueryResult } from '../types/atom';
import { PLNRules } from './rules';

export class PLNEngine {
  constructor(private atomSpace: Map<string, Atom>) {}

  inferenceStep(): Atom[] {
    const newInferences: Atom[] = [];
    const rules = Object.values(PLNRules);

    for (const rule of rules) {
      const candidates = this.findCandidates(rule);
      
      for (const atoms of candidates) {
        if (rule.validate(atoms)) {
          const inferences = rule.apply(atoms);
          newInferences.push(...inferences);
        }
      }
    }

    return newInferences;
  }

  private findCandidates(rule: PLNRules[keyof PLNRules]): Atom[][] {
    // Find sets of atoms that might be valid for the rule
    const atoms = Array.from(this.atomSpace.values());
    const candidates: Atom[][] = [];

    // Generate combinations based on rule requirements
    for (let i = 0; i < atoms.length; i++) {
      for (let j = i + 1; j < atoms.length; j++) {
        candidates.push([atoms[i], atoms[j]]);
        
        // For rules that need three atoms
        for (let k = j + 1; k < atoms.length; k++) {
          candidates.push([atoms[i], atoms[j], atoms[k]]);
        }
      }
    }

    return candidates;
  }

  runInference(steps: number = 100): Atom[] {
    let allInferences: Atom[] = [];
    
    for (let i = 0; i < steps; i++) {
      const newInferences = this.inferenceStep();
      if (newInferences.length === 0) break;
      
      allInferences = [...allInferences, ...newInferences];
      
      // Add new inferences to atom space
      newInferences.forEach(atom => {
        this.atomSpace.set(atom.id, atom);
      });
    }

    return allInferences;
  }
}