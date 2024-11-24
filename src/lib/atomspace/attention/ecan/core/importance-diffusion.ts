import { Atom } from '../../../types';
import { ECANConfig } from '../config/ecan-config';
import { AttentionUtils } from '../utils/attention-utils';
import { HebbianUtils } from '../utils/hebbian-utils';

export class ImportanceDiffusion {
  private attentionUtils: AttentionUtils;
  private hebbianUtils: HebbianUtils;

  constructor(
    private atomSpace: Map<string, Atom>,
    private config: ECANConfig
  ) {
    this.attentionUtils = new AttentionUtils(config);
    this.hebbianUtils = new HebbianUtils(atomSpace);
  }

  diffuseImportance(atoms: Atom[]): Map<string, Atom> {
    const updates = new Map<string, Atom>();
    const diffusionCandidates = this.selectDiffusionCandidates(atoms);

    diffusionCandidates.forEach(source => {
      if (!source.attention || !source.outgoing) return;

      const totalSpread = source.attention.sti * this.config.spreadingFactor;
      if (Math.abs(totalSpread) < this.config.spreadingThreshold) return;

      const targets = this.getTargetAtoms(source);
      if (targets.length === 0) return;

      const spreadPerTarget = totalSpread / targets.length;

      targets.forEach(target => {
        if (!target.attention) return;

        const hebbianWeight = this.hebbianUtils.getHebbianStrength(source, target);
        const spreadAmount = spreadPerTarget * hebbianWeight;
        
        const updatedTarget = {
          ...target,
          attention: this.attentionUtils.updateSTI(target.attention, spreadAmount)
        };
        updates.set(target.id, updatedTarget);
      });

      // Update source atom's STI after spreading
      const remainingSTI = source.attention.sti * (1 - this.config.spreadingFactor);
      updates.set(source.id, {
        ...source,
        attention: {
          ...source.attention,
          sti: remainingSTI
        }
      });
    });

    return updates;
  }

  private selectDiffusionCandidates(atoms: Atom[]): Atom[] {
    return atoms
      .filter(atom => 
        atom.attention && 
        atom.outgoing &&
        Math.abs(atom.attention.sti) > this.config.spreadingThreshold
      )
      .sort((a, b) => 
        Math.abs(b.attention!.sti) - Math.abs(a.attention!.sti)
      )
      .slice(0, Math.ceil(atoms.length * 0.1));
  }

  private getTargetAtoms(source: Atom): Atom[] {
    return source.outgoing!
      .map(id => this.atomSpace.get(id))
      .filter((atom): atom is Atom => 
        atom !== undefined && atom.attention !== undefined
      );
  }
}