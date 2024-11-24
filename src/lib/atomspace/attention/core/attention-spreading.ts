import { Atom, AttentionValue } from '../../types';
import { ECANConfig } from '../config/ecan-config';

export class AttentionSpreading {
  constructor(
    private atomSpace: Map<string, Atom>,
    private config: ECANConfig
  ) {}

  spreadAttention(sourceAtom: Atom): Map<string, AttentionValue> {
    const updates = new Map<string, AttentionValue>();
    if (!sourceAtom.attention || !sourceAtom.outgoing) return updates;

    const spreadAmount = sourceAtom.attention.sti * this.config.spreadingFactor;
    if (Math.abs(spreadAmount) < this.config.spreadingThreshold) return updates;

    const targets = this.getTargetAtoms(sourceAtom);
    const spreadPerTarget = spreadAmount / targets.length;

    targets.forEach(target => {
      if (!target.attention) return;

      const hebbianWeight = this.getHebbianWeight(sourceAtom, target);
      const newSTI = target.attention.sti + (spreadPerTarget * hebbianWeight);

      updates.set(target.id, {
        sti: this.normalizeSTI(newSTI),
        lti: target.attention.lti,
        vlti: target.attention.vlti
      });
    });

    // Update source atom's STI after spreading
    const remainingSTI = sourceAtom.attention.sti * (1 - this.config.spreadingFactor);
    updates.set(sourceAtom.id, {
      ...sourceAtom.attention,
      sti: this.normalizeSTI(remainingSTI)
    });

    return updates;
  }

  private getTargetAtoms(source: Atom): Atom[] {
    return source.outgoing
      ?.map(id => this.atomSpace.get(id))
      .filter((atom): atom is Atom => atom !== undefined) ?? [];
  }

  private getHebbianWeight(source: Atom, target: Atom): number {
    const hebbianLink = Array.from(this.atomSpace.values()).find(atom =>
      atom.type === 'HebbianLink' &&
      atom.outgoing?.includes(source.id) &&
      atom.outgoing?.includes(target.id)
    );

    return hebbianLink?.truthValue?.strength ?? 0.5;
  }

  private normalizeSTI(sti: number): number {
    return Math.max(this.config.minSTI, 
           Math.min(this.config.maxSTI, sti));
  }
}