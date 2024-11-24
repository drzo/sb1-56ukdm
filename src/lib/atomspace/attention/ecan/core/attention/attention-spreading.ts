import { Atom } from '../../../../types';
import { ECANConfig } from '../../config/ecan-config';
import { AttentionUtils } from '../../utils/attention-utils';
import { HebbianUtils } from '../../utils/hebbian-utils';

export class AttentionSpreading {
  private attentionUtils: AttentionUtils;
  private hebbianUtils: HebbianUtils;

  constructor(
    private atomSpace: Map<string, Atom>,
    private config: ECANConfig
  ) {
    this.attentionUtils = new AttentionUtils(config);
    this.hebbianUtils = new HebbianUtils(atomSpace);
  }

  spreadAttention(sourceAtom: Atom): Map<string, Atom> {
    const updates = new Map<string, Atom>();
    if (!sourceAtom.attention || !sourceAtom.outgoing) return updates;

    const spreadAmount = this.calculateSpreadAmount(sourceAtom);
    if (spreadAmount === 0) return updates;

    const targets = this.getTargetAtoms(sourceAtom);
    const spreadPerTarget = spreadAmount / targets.length;

    targets.forEach(target => {
      if (!target.attention) return;

      const hebbianWeight = this.hebbianUtils.getHebbianStrength(sourceAtom, target);
      const actualSpread = spreadPerTarget * hebbianWeight;
      
      updates.set(target.id, {
        ...target,
        attention: {
          ...target.attention,
          sti: this.attentionUtils.normalizeSTI(target.attention.sti + actualSpread)
        }
      });
    });

    // Update source atom's STI after spreading
    const remainingSTI = sourceAtom.attention.sti * (1 - this.config.spreadingFactor);
    updates.set(sourceAtom.id, {
      ...sourceAtom,
      attention: {
        ...sourceAtom.attention,
        sti: this.attentionUtils.normalizeSTI(remainingSTI)
      }
    });

    return updates;
  }

  private calculateSpreadAmount(atom: Atom): number {
    if (!atom.attention) return 0;
    
    const spreadAmount = atom.attention.sti * this.config.spreadingFactor;
    return Math.abs(spreadAmount) < this.config.spreadingThreshold ? 0 : spreadAmount;
  }

  private getTargetAtoms(source: Atom): Atom[] {
    return source.outgoing!
      .map(id => this.atomSpace.get(id))
      .filter((atom): atom is Atom => 
        atom !== undefined && atom.attention !== undefined
      );
  }
}