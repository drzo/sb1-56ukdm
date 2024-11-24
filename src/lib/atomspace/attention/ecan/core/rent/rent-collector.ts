import { Atom, AttentionValue } from '../../../../types';
import { ECANConfig } from '../../config/ecan-config';
import { AttentionUtils } from '../../utils/attention-utils';

export class RentCollector {
  private utils: AttentionUtils;

  constructor(private config: ECANConfig) {
    this.utils = new AttentionUtils(config);
  }

  collectAndRedistribute(atoms: Atom[]): Map<string, Atom> {
    // 1. Collect rent from all atoms
    const rentUpdates = this.collectRent(atoms);
    
    // 2. Calculate total collected rent
    const totalRent = Array.from(rentUpdates.values())
      .reduce((sum, atom) => sum + (atom.attention?.sti ?? 0), 0);

    // 3. Redistribute collected rent
    const redistributionUpdates = this.redistributeRent(totalRent, atoms);

    // 4. Merge updates
    return this.mergeUpdates(rentUpdates, redistributionUpdates);
  }

  private collectRent(atoms: Atom[]): Map<string, Atom> {
    const updates = new Map<string, Atom>();

    atoms.forEach(atom => {
      if (!atom.attention) return;

      const rent = this.calculateRent(atom);
      const newSTI = atom.attention.sti - rent;

      updates.set(atom.id, {
        ...atom,
        attention: {
          ...atom.attention,
          sti: this.utils.normalizeSTI(newSTI)
        }
      });
    });

    return updates;
  }

  private calculateRent(atom: Atom): number {
    if (!atom.attention) return 0;

    // Base rent proportional to STI
    const baseRent = Math.max(0, atom.attention.sti) * this.config.rentScale;

    // Apply discounts
    const ltiDiscount = 1 - (atom.attention.lti / this.config.maxLTI);
    const vltiDiscount = atom.attention.vlti ? this.config.vltiRentDiscount : 0;

    return baseRent * ltiDiscount * (1 - vltiDiscount);
  }

  private redistributeRent(totalRent: number, atoms: Atom[]): Map<string, Atom> {
    const updates = new Map<string, Atom>();
    const eligibleAtoms = atoms.filter(atom => 
      atom.attention && atom.attention.sti > 0
    );

    if (eligibleAtoms.length === 0) return updates;

    const rentPerAtom = totalRent / eligibleAtoms.length;

    eligibleAtoms.forEach(atom => {
      if (!atom.attention) return;

      const newSTI = atom.attention.sti + rentPerAtom;
      updates.set(atom.id, {
        ...atom,
        attention: {
          ...atom.attention,
          sti: this.utils.normalizeSTI(newSTI)
        }
      });
    });

    return updates;
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