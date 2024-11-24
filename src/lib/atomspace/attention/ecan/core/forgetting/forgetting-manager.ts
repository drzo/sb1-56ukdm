import { Atom } from '../../../../types';
import { ECANConfig } from '../../config/ecan-config';
import { AttentionUtils } from '../../utils/attention-utils';

export class ForgettingManager {
  private utils: AttentionUtils;

  constructor(private config: ECANConfig) {
    this.utils = new AttentionUtils(config);
  }

  selectAtomsToForget(atoms: Atom[]): Atom[] {
    const candidates = atoms.filter(atom => this.canBeRemoved(atom));
    
    // Sort by removal priority (lower = more likely to be removed)
    candidates.sort((a, b) => 
      this.getRemovalPriority(a) - this.getRemovalPriority(b)
    );

    // Select atoms to forget based on forgetting threshold
    const maxToForget = Math.floor(atoms.length * this.config.maxForgettingPercentage);
    return candidates.slice(0, maxToForget);
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
}