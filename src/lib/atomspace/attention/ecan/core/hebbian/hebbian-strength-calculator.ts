import { Atom } from '../../../../types';
import { ECANConfig } from '../../config/ecan-config';

export class HebbianStrengthCalculator {
  constructor(private config: ECANConfig) {}

  calculateStrength(
    source: Atom,
    target: Atom,
    existingLink?: Atom
  ): number {
    const coActivation = this.calculateCoActivation(source, target);
    
    if (!existingLink?.truthValue) {
      return coActivation;
    }

    return this.updateHebbianStrength(
      existingLink.truthValue.strength,
      coActivation
    );
  }

  private calculateCoActivation(source: Atom, target: Atom): number {
    if (!source.attention || !target.attention) return 0;

    const sourceSTI = this.normalizeSTI(source.attention.sti);
    const targetSTI = this.normalizeSTI(target.attention.sti);
    
    return Math.min(sourceSTI, targetSTI);
  }

  private normalizeSTI(sti: number): number {
    return (sti - this.config.minSTI) / (this.config.maxSTI - this.config.minSTI);
  }

  private updateHebbianStrength(
    currentStrength: number,
    coActivation: number
  ): number {
    const delta = coActivation - currentStrength;
    return currentStrength + (delta * this.config.hebbianLearningRate);
  }
}