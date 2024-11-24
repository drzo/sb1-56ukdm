import { Atom, AttentionValue } from '../../types';
import { ECANConfig } from './ecan-config';

export class StimulusProcessor {
  constructor(private config: ECANConfig) {}

  processStimulus(
    atom: Atom,
    stimulus: number,
    context?: Atom
  ): AttentionValue {
    if (!atom.attention) {
      throw new Error('Atom must have attention value');
    }

    // Base STI adjustment
    let stiAdjustment = stimulus;

    // Adjust based on context if available
    if (context?.attention) {
      stiAdjustment *= this.getContextualMultiplier(context);
    }

    // Apply hebbian learning bonus if applicable
    if (context) {
      stiAdjustment *= this.getHebbianBonus(atom, context);
    }

    // Calculate new STI value
    const newSTI = Math.max(
      this.config.minSTI,
      Math.min(
        this.config.maxSTI,
        atom.attention.sti + stiAdjustment
      )
    );

    // Update LTI if stimulus is significant
    const ltiAdjustment = Math.abs(stimulus) > 10 ? 1 : 0;
    const newLTI = Math.min(
      this.config.maxLTI,
      atom.attention.lti + ltiAdjustment
    );

    return {
      sti: newSTI,
      lti: newLTI,
      vlti: atom.attention.vlti || newLTI > this.config.maxLTI * 0.8
    };
  }

  private getContextualMultiplier(context: Atom): number {
    // Higher context STI = stronger influence
    const contextInfluence = (context.attention!.sti + 100) / 200;
    return 0.5 + (contextInfluence * 0.5);
  }

  private getHebbianBonus(atom: Atom, context: Atom): number {
    if (!atom.attention || !context.attention) return 1;

    // Calculate co-activation strength
    const coActivation = Math.min(
      (atom.attention.sti + 100) / 200,
      (context.attention.sti + 100) / 200
    );

    return 1 + (coActivation * 0.5);
  }
}