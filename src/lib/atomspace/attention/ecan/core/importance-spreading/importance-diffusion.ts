import { Atom, AttentionValue } from '../../../../types';
import { ECANConfig } from '../../config/ecan-config';
import { HebbianUtils } from '../../utils/hebbian-utils';
import { AttentionUtils } from '../../utils/attention-utils';

export class ImportanceDiffusion {
  private hebbianUtils: HebbianUtils;
  private attentionUtils: AttentionUtils;

  constructor(
    private atomSpace: Map<string, Atom>,
    private config: ECANConfig
  ) {
    this.hebbianUtils = new HebbianUtils(atomSpace);
    this.attentionUtils = new AttentionUtils(config);
  }

  diffuseImportance(sourceAtom: Atom): Map<string, AttentionValue> {
    const updates = new Map<string, AttentionValue>();
    if (!sourceAtom.attention || !sourceAtom.outgoing) return updates;

    // Calculate total spread amount based on source STI
    const totalSpread = this.calculateSpreadAmount(sourceAtom);
    if (Math.abs(totalSpread) < this.config.spreadingThreshold) return updates;

    // Get diffusion targets with weights
    const targets = this.getDiffusionTargets(sourceAtom);
    if (targets.length === 0) return updates;

    // Calculate spread per target considering weights
    const totalWeight = targets.reduce((sum, t) => sum + t.weight, 0);
    targets.forEach(target => {
      const spreadAmount = (totalSpread * target.weight) / totalWeight;
      this.updateTargetSTI(target.atom, spreadAmount, updates);
    });

    // Update source atom's STI after spreading
    this.updateSourceSTI(sourceAtom, totalSpread, updates);

    return updates;
  }

  private calculateSpreadAmount(atom: Atom): number {
    const sti = atom.attention!.sti;
    const scaledSTI = this.attentionUtils.normalizeSTI(sti);
    return scaledSTI * this.config.spreadingFactor;
  }

  private getDiffusionTargets(source: Atom): Array<{ atom: Atom; weight: number }> {
    const directTargets = this.getDirectTargets(source);
    const indirectTargets = this.getIndirectTargets(source);
    
    return [...directTargets, ...indirectTargets]
      .filter(target => this.isValidTarget(target.atom));
  }

  private getDirectTargets(source: Atom): Array<{ atom: Atom; weight: number }> {
    return source.outgoing!
      .map(id => this.atomSpace.get(id))
      .filter((atom): atom is Atom => atom !== undefined)
      .map(atom => ({
        atom,
        weight: this.calculateDirectWeight(source, atom)
      }));
  }

  private getIndirectTargets(source: Atom): Array<{ atom: Atom; weight: number }> {
    return Array.from(this.atomSpace.values())
      .filter(atom => this.hasIndirectConnection(source, atom))
      .map(atom => ({
        atom,
        weight: this.calculateIndirectWeight(source, atom)
      }));
  }

  private calculateDirectWeight(source: Atom, target: Atom): number {
    const hebbianWeight = this.hebbianUtils.getHebbianStrength(source, target);
    const attentionWeight = this.calculateAttentionWeight(target);
    return hebbianWeight * attentionWeight;
  }

  private calculateIndirectWeight(source: Atom, target: Atom): number {
    const baseWeight = this.calculateDirectWeight(source, target);
    return baseWeight * 0.5; // Reduce influence for indirect connections
  }

  private calculateAttentionWeight(atom: Atom): number {
    if (!atom.attention) return 0;
    
    const normalizedSTI = (atom.attention.sti + 100) / 200;
    const normalizedLTI = atom.attention.lti / 100;
    
    return (normalizedSTI * 0.7) + (normalizedLTI * 0.3);
  }

  private hasIndirectConnection(source: Atom, target: Atom): boolean {
    return source.id !== target.id && 
           !source.outgoing?.includes(target.id) &&
           this.hebbianUtils.hasIndirectConnection(source, target);
  }

  private isValidTarget(atom: Atom): boolean {
    return atom.attention !== undefined && 
           !atom.attention.vlti && // Don't spread to VLTI atoms
           Math.abs(atom.attention.sti) < this.config.maxSTI;
  }

  private updateTargetSTI(
    target: Atom,
    spreadAmount: number,
    updates: Map<string, AttentionValue>
  ): void {
    if (!target.attention) return;

    const newSTI = this.attentionUtils.updateSTI(
      target.attention.sti,
      spreadAmount
    );

    updates.set(target.id, {
      ...target.attention,
      sti: newSTI
    });
  }

  private updateSourceSTI(
    source: Atom,
    totalSpread: number,
    updates: Map<string, AttentionValue>
  ): void {
    const remainingSTI = source.attention!.sti * (1 - this.config.spreadingFactor);
    
    updates.set(source.id, {
      ...source.attention!,
      sti: this.attentionUtils.normalizeSTI(remainingSTI)
    });
  }
}