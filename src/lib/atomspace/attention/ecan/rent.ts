import { Atom, AttentionValue } from '../../types';
import { ECANConfig } from './ecan-config';

export class AttentionRent {
  constructor(private config: ECANConfig) {}

  calculateRent(atom: Atom): number {
    if (!atom.attention) return 0;

    // Base rent is proportional to STI
    const baseRent = Math.max(0, atom.attention.sti) / 100;

    // Adjust rent based on LTI
    const ltiDiscount = 1 - (atom.attention.lti / 100);
    
    // VLTI atoms pay minimal rent
    const vltiDiscount = atom.attention.vlti ? 0.9 : 0;

    // Calculate final rent
    return baseRent * ltiDiscount * (1 - vltiDiscount);
  }

  collectRent(atoms: Atom[]): Map<string, AttentionValue> {
    const updates = new Map<string, AttentionValue>();

    atoms.forEach(atom => {
      if (!atom.attention) return;

      const rent = this.calculateRent(atom);
      const newSTI = atom.attention.sti - rent;

      updates.set(atom.id, {
        ...atom.attention,
        sti: newSTI
      });
    });

    return updates;
  }

  redistributeRent(
    collectedRent: number,
    atoms: Atom[]
  ): Map<string, AttentionValue> {
    const updates = new Map<string, AttentionValue>();
    const eligibleAtoms = atoms.filter(atom => 
      atom.attention && atom.attention.sti > 0
    );

    if (eligibleAtoms.length === 0) return updates;

    const rentPerAtom = collectedRent / eligibleAtoms.length;

    eligibleAtoms.forEach(atom => {
      if (!atom.attention) return;

      updates.set(atom.id, {
        ...atom.attention,
        sti: atom.attention.sti + rentPerAtom
      });
    });

    return updates;
  }
}