import { Atom } from '../../../types';
import { ECANConfig } from '../config/ecan-config';
import { AttentionAllocation } from './attention/attention-allocation';
import { AttentionDecay } from './attention/attention-decay';
import { AttentionRent } from './attention/attention-rent';

export class AttentionManager {
  private allocation: AttentionAllocation;
  private decay: AttentionDecay;
  private rent: AttentionRent;

  constructor(
    private atomSpace: Map<string, Atom>,
    private config: ECANConfig
  ) {
    this.allocation = new AttentionAllocation(config);
    this.decay = new AttentionDecay(config);
    this.rent = new AttentionRent(config);
  }

  updateAttention(atoms: Atom[]): Map<string, Atom> {
    // 1. Collect rent
    const rentUpdates = this.rent.collectRent(atoms);
    const totalRent = this.calculateTotalRent(rentUpdates);
    
    // 2. Allocate attention based on importance
    const allocationUpdates = this.allocation.allocateAttention(atoms, totalRent);
    
    // 3. Apply decay
    const decayUpdates = this.decay.decayAttention(atoms);
    
    // Merge all updates
    return this.mergeUpdates(rentUpdates, allocationUpdates, decayUpdates);
  }

  private calculateTotalRent(rentUpdates: Map<string, Atom>): number {
    return Array.from(rentUpdates.values())
      .reduce((sum, atom) => sum + (atom.attention?.sti ?? 0), 0);
  }

  private mergeUpdates(...updates: Map<string, Atom>[]): Map<string, Atom> {
    const merged = new Map<string, Atom>();
    
    updates.forEach(updateMap => {
      updateMap.forEach((atom, id) => {
        const existing = merged.get(id);
        if (existing) {
          merged.set(id, this.mergeAtomUpdates(existing, atom));
        } else {
          merged.set(id, atom);
        }
      });
    });

    return merged;
  }

  private mergeAtomUpdates(atom1: Atom, atom2: Atom): Atom {
    return {
      ...atom1,
      ...atom2,
      attention: atom1.attention && atom2.attention ? {
        sti: atom2.attention.sti,
        lti: Math.max(atom1.attention.lti, atom2.attention.lti),
        vlti: atom1.attention.vlti || atom2.attention.vlti
      } : atom2.attention
    };
  }
}