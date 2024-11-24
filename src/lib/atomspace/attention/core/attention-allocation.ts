import { Atom, AttentionValue } from '../../types';
import { ECANConfig } from '../config/ecan-config';

export class AttentionAllocation {
  constructor(private config: ECANConfig) {}

  allocateAttention(atoms: Atom[], totalSTI: number): Map<string, AttentionValue> {
    const updates = new Map<string, AttentionValue>();
    const importantAtoms = this.selectImportantAtoms(atoms);
    
    const totalImportance = importantAtoms.reduce(
      (sum, atom) => sum + this.calculateImportance(atom), 
      0
    );

    importantAtoms.forEach(atom => {
      if (!atom.attention) return;

      const importance = this.calculateImportance(atom);
      const proportion = importance / totalImportance;
      const newSTI = totalSTI * proportion;

      updates.set(atom.id, {
        sti: this.normalizeSTI(newSTI),
        lti: this.updateLTI(atom),
        vlti: this.shouldBeVLTI(atom, newSTI)
      });
    });

    return updates;
  }

  private selectImportantAtoms(atoms: Atom[]): Atom[] {
    return atoms
      .filter(atom => atom.attention && atom.truthValue)
      .sort((a, b) => this.calculateImportance(b) - this.calculateImportance(a))
      .slice(0, Math.ceil(atoms.length * 0.2)); // Top 20%
  }

  private calculateImportance(atom: Atom): number {
    if (!atom.attention || !atom.truthValue) return 0;

    const stiWeight = 0.7;
    const ltiWeight = 0.2;
    const truthWeight = 0.1;

    return (atom.attention.sti * stiWeight) +
           (atom.attention.lti * ltiWeight) +
           ((atom.truthValue.strength * atom.truthValue.confidence) * truthWeight);
  }

  private normalizeSTI(sti: number): number {
    return Math.max(this.config.minSTI, 
           Math.min(this.config.maxSTI, sti));
  }

  private updateLTI(atom: Atom): number {
    if (!atom.attention) return 0;
    
    const ltiIncrement = atom.attention.sti > 0 ? 1 : 0;
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