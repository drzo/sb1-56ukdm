import { Atom } from '../../../../types';
import { ECANConfig } from '../../config/ecan-config';
import { AttentionUtils } from '../../utils/attention-utils';

export class AttentionRent {
  private utils: AttentionUtils;

  constructor(private config: ECANConfig) {
    this.utils = new AttentionUtils(config);
  }

  collectRent(atoms: Atom[]): Map<string, Atom> {
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

  redistributeRent(totalRent: number, atoms: Atom[]): Map<string, Atom> {
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
}