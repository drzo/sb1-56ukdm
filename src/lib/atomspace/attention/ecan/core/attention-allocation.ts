import { Atom } from '../../../types';
import { ECANConfig } from '../config/ecan-config';
import { AttentionUtils } from '../utils/attention-utils';

export class AttentionAllocation {
  private utils: AttentionUtils;

  constructor(private config: ECANConfig) {
    this.utils = new AttentionUtils(config);
  }

  getTopAttentionAtoms(atoms: Atom[], count: number): Atom[] {
    return atoms
      .filter(atom => atom.attention)
      .sort((a, b) => this.utils.calculateImportance(b) - 
                      this.utils.calculateImportance(a))
      .slice(0, count);
  }

  allocateAttention(atoms: Atom[], totalSTI: number): Map<string, Atom> {
    const updates = new Map<string, Atom>();
    const importantAtoms = this.getTopAttentionAtoms(atoms, Math.ceil(atoms.length * 0.2));
    
    const totalImportance = importantAtoms.reduce(
      (sum, atom) => sum + this.utils.calculateImportance(atom), 
      0
    );

    importantAtoms.forEach(atom => {
      if (!atom.attention) return;

      const importance = this.utils.calculateImportance(atom);
      const proportion = importance / totalImportance;
      const newSTI = totalSTI * proportion;

      updates.set(atom.id, {
        ...atom,
        attention: {
          ...atom.attention,
          sti: newSTI
        }
      });
    });

    return updates;
  }
}