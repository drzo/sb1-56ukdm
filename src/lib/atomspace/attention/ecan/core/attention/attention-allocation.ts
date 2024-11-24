import { Atom } from '../../../../types';
import { ECANConfig } from '../../config/ecan-config';
import { AttentionUtils } from '../../utils/attention-utils';

export class AttentionAllocation {
  private utils: AttentionUtils;

  constructor(private config: ECANConfig) {
    this.utils = new AttentionUtils(config);
  }

  allocateAttention(atoms: Atom[], totalSTI: number): Map<string, Atom> {
    const updates = new Map<string, Atom>();
    const importantAtoms = this.selectImportantAtoms(atoms);
    
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
          sti: newSTI,
          lti: this.updateLTI(atom, newSTI),
          vlti: this.shouldBeVLTI(atom, newSTI)
        }
      });
    });

    return updates;
  }

  private selectImportantAtoms(atoms: Atom[]): Atom[] {
    return atoms
      .filter(atom => atom.attention)
      .sort((a, b) => this.utils.calculateImportance(b) - 
                      this.utils.calculateImportance(a))
      .slice(0, Math.ceil(atoms.length * 0.2)); // Top 20%
  }

  private updateLTI(atom: Atom, newSTI: number): number {
    if (!atom.attention) return 0;
    
    const ltiIncrement = newSTI > this.config.maxSTI * 0.8 ? 1 : 0;
    return Math.min(
      this.config.maxLTI,
      atom.attention.lti + ltiIncrement
    );
  }

  private shouldBeVLTI(atom: Atom, newSTI: number): boolean {
    if (!atom.attention) return false;
    return atom.attention.lti > this.config.maxLTI * 0.8 ||
           newSTI > this.config.maxSTI * 0.9;
  }
}