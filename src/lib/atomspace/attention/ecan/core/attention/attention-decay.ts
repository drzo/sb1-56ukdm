import { Atom } from '../../../../types';
import { ECANConfig } from '../../config/ecan-config';
import { AttentionUtils } from '../../utils/attention-utils';

export class AttentionDecay {
  private utils: AttentionUtils;

  constructor(private config: ECANConfig) {
    this.utils = new AttentionUtils(config);
  }

  decayAttention(atoms: Atom[]): Map<string, Atom> {
    const updates = new Map<string, Atom>();

    atoms.forEach(atom => {
      if (!atom.attention || atom.attention.vlti) return;

      const decayedSTI = atom.attention.sti * (1 - this.config.attentionDecayRate);
      const decayedLTI = atom.attention.lti * (1 - this.config.attentionDecayRate / 2);

      updates.set(atom.id, {
        ...atom,
        attention: {
          sti: this.utils.normalizeSTI(decayedSTI),
          lti: this.utils.normalizeLTI(decayedLTI),
          vlti: atom.attention.vlti
        }
      });
    });

    return updates;
  }

  getDecayFactor(timeElapsed: number): number {
    return Math.exp(-this.config.attentionDecayRate * timeElapsed);
  }

  shouldDecay(atom: Atom): boolean {
    return atom.attention !== undefined && 
           !atom.attention.vlti &&
           Math.abs(atom.attention.sti) > this.config.minSTI;
  }
}