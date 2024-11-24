import { Atom, AttentionValue } from '../../../types';
import { ECANConfig } from '../config/ecan-config';
import { AttentionDynamics } from './attention-dynamics';

export class ImportanceSpreading {
  private dynamics: AttentionDynamics;

  constructor(
    private atomSpace: Map<string, Atom>,
    private config: ECANConfig
  ) {
    this.dynamics = new AttentionDynamics(config);
  }

  spreadImportance(sourceAtom: Atom): Map<string, AttentionValue> {
    const updates = new Map<string, AttentionValue>();
    if (!sourceAtom.attention || !sourceAtom.outgoing) return updates;

    const totalSpread = sourceAtom.attention.sti * this.config.spreadingFactor;
    if (Math.abs(totalSpread) < this.config.spreadingThreshold) return updates;

    const targets = this.getTargetAtoms(sourceAtom);
    const spreadPerTarget = totalSpread / targets.length;

    targets.forEach(target => {
      if (!target.attention) return;

      const hebbianWeight = this.getHebbianWeight(sourceAtom, target);
      const spreadAmount = spreadPerTarget * hebbianWeight;
      
      const newAV = this.dynamics.updateSTI(target.attention, spreadAmount);
      updates.set(target.id, newAV);
    });

    // Update source atom's STI after spreading
    const remainingSTI = sourceAtom.attention.sti * (1 - this.config.spreadingFactor);
    updates.set(sourceAtom.id, {
      ...sourceAtom.attention,
      sti: remainingSTI
    });

    return updates;
  }

  private getTargetAtoms(source: Atom): Atom[] {
    return source.outgoing
      ?.map(id => this.atomSpace.get(id))
      .filter((atom): atom is Atom => atom !== undefined) ?? [];
  }

  private getHebbianWeight(source: Atom, target: Atom): number {
    // Find HebbianLink between atoms if it exists
    const hebbianLink = Array.from(this.atomSpace.values()).find(atom =>
      atom.type === 'HebbianLink' &&
      atom.outgoing?.includes(source.id) &&
      atom.outgoing?.includes(target.id)
    );

    if (hebbianLink?.truthValue) {
      return hebbianLink.truthValue.strength;
    }

    // Default weight if no HebbianLink exists
    return 0.5;
  }
}