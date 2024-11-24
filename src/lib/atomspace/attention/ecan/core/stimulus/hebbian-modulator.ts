import { Atom } from '../../../../types';
import { ECANConfig } from '../../config/ecan-config';

export class HebbianModulator {
  constructor(private config: ECANConfig) {}

  applyHebbianModulation(
    adjustment: number,
    atom: Atom,
    context: Atom
  ): number {
    if (!atom.attention || !context.attention) return adjustment;

    const coActivation = this.calculateCoActivation(atom, context);
    return adjustment * (1 + (coActivation * 0.5));
  }

  private calculateCoActivation(atom: Atom, context: Atom): number {
    if (!atom.attention || !context.attention) return 0;

    return Math.min(
      (atom.attention.sti + 100) / 200,
      (context.attention.sti + 100) / 200
    );
  }
}