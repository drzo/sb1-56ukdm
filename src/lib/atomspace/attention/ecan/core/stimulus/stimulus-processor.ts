import { Atom } from '../../../../types';
import { ECANConfig } from '../../config/ecan-config';
import { StimulusCalculator } from './stimulus-calculator';
import { StimulusNormalizer } from './stimulus-normalizer';
import { HebbianModulator } from './hebbian-modulator';

export class StimulusProcessor {
  private calculator: StimulusCalculator;
  private normalizer: StimulusNormalizer;
  private modulator: HebbianModulator;

  constructor(private config: ECANConfig) {
    this.calculator = new StimulusCalculator(config);
    this.normalizer = new StimulusNormalizer(config);
    this.modulator = new HebbianModulator(config);
  }

  processStimulus(atom: Atom, stimulus: number, context?: Atom): Atom {
    if (!atom.attention) {
      throw new Error('Atom must have attention value');
    }

    // Calculate base stimulus adjustment
    const baseAdjustment = this.calculator.calculateBaseAdjustment(stimulus);

    // Apply contextual modulation if available
    const contextualAdjustment = context 
      ? this.calculator.calculateContextualAdjustment(baseAdjustment, context)
      : baseAdjustment;

    // Apply hebbian learning bonus if applicable
    const finalAdjustment = context
      ? this.modulator.applyHebbianModulation(contextualAdjustment, atom, context)
      : contextualAdjustment;

    // Normalize and update attention values
    return this.normalizer.updateAttentionValues(atom, finalAdjustment);
  }
}