import { Atom, AttentionValue } from '../../types';
import { ECANConfig } from './ecan-config';

export class ForgettingMechanism {
  constructor(private config: ECANConfig) {}

  selectAtomsToForget(atoms: Atom[], targetCount: number): Atom[] {
    return atoms
      .filter(atom => this.canBeRemoved(atom))
      .sort((a, b) => this.getRemovalPriority(a) - this.getRemovalPriority(b))
      .slice(0, targetCount);
  }

  private canBeRemoved(atom: Atom): boolean {
    if (!atom.attention) return true;
    
    // Never remove VLTI atoms
    if (atom.attention.vlti) return false;

    // Keep atoms with high LTI
    if (atom.attention.lti > this.config.maxLTI * 0.8) return false;

    // Keep atoms with significant STI
    if (atom.attention.sti > 0) return false;

    return true;
  }

  private getRemovalPriority(atom: Atom): number {
    if (!atom.attention) return 1;

    // Lower priority = more likely to be removed
    const stiComponent = (atom.attention.sti + 100) / 200; // Normalize to [0,1]
    const ltiComponent = atom.attention.lti / 100;
    
    // Consider truth value confidence if available
    const confidenceComponent = atom.truthValue?.confidence ?? 0.5;

    return (stiComponent * 0.5) + (ltiComponent * 0.3) + (confidenceComponent * 0.2);
  }

  shouldForgetsAtom(atom: Atom): boolean {
    if (!atom.attention) return true;

    const totalImportance = 
      (atom.attention.sti / 200 + 0.5) * 0.7 + // Normalized STI
      (atom.attention.lti / 100) * 0.3;        // Normalized LTI

    return totalImportance < 0.2; // Threshold for forgetting
  }
}