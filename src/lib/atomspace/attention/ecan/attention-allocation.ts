import { Atom, AttentionValue } from '../../types';
import { ECANConfig } from './ecan-config';
import { AttentionDynamics } from './attention-dynamics';

export class AttentionAllocation {
  private dynamics: AttentionDynamics;

  constructor(private config: ECANConfig) {
    this.dynamics = new AttentionDynamics(config);
  }

  allocateAttention(atoms: Atom[], totalSTI: number): Map<string, AttentionValue> {
    const updates = new Map<string, AttentionValue>();
    const importantAtoms = this.selectImportantAtoms(atoms);
    
    // Calculate total importance for normalization
    const totalImportance = importantAtoms.reduce(
      (sum, atom) => sum + this.dynamics.calculateImportance(atom), 0
    );

    // Allocate STI proportionally to importance
    importantAtoms.forEach(atom => {
      if (!atom.attention) return;

      const importance = this.dynamics.calculateImportance(atom);
      const proportion = importance / totalImportance;
      const newSTI = totalSTI * proportion;

      updates.set(atom.id, {
        ...atom.attention,
        sti: newSTI
      });
    });

    return updates;
  }

  private selectImportantAtoms(atoms: Atom[]): Atom[] {
    return atoms
      .filter(atom => {
        const importance = this.dynamics.calculateImportance(atom);
        return importance > 0;
      })
      .sort((a, b) => 
        this.dynamics.calculateImportance(b) - 
        this.dynamics.calculateImportance(a)
      )
      .slice(0, Math.ceil(atoms.length * 0.2)); // Top 20%
  }

  stimulateAtom(atom: Atom, stimulus: number): AttentionValue {
    if (!atom.attention) {
      throw new Error('Atom must have attention value');
    }

    return this.dynamics.updateSTI(atom.attention, stimulus);
  }
}