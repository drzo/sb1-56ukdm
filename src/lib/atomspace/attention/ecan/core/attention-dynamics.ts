import { Atom, AttentionValue } from '../../../types';
import { ECANConfig } from '../config/ecan-config';

export class AttentionDynamics {
  constructor(private config: ECANConfig) {}

  decayAttention(av: AttentionValue): AttentionValue {
    // Apply non-linear decay based on current values
    const stiDecay = this.calculateSTIDecay(av.sti);
    const ltiDecay = this.calculateLTIDecay(av.lti);

    return {
      sti: av.sti * (1 - stiDecay),
      lti: av.lti * (1 - ltiDecay),
      vlti: av.vlti
    };
  }

  private calculateSTIDecay(sti: number): number {
    // Non-linear decay: faster decay for extreme values
    const normalizedSTI = (sti - this.config.minSTI) / 
                         (this.config.maxSTI - this.config.minSTI);
    const nonLinearFactor = Math.pow(normalizedSTI, this.config.stiNonLinearityFactor);
    return this.config.attentionDecayRate * (1 + nonLinearFactor * 0.5);
  }

  private calculateLTIDecay(lti: number): number {
    // Stability-aware LTI decay
    const normalizedLTI = lti / this.config.maxLTI;
    const stabilityFactor = Math.pow(1 - normalizedLTI, this.config.ltiStabilityFactor);
    return this.config.attentionDecayRate * stabilityFactor * 0.5;
  }

  normalizeAttention(av: AttentionValue): AttentionValue {
    const normalizedSTI = Math.max(
      this.config.minSTI,
      Math.min(this.config.maxSTI, av.sti)
    );

    const normalizedLTI = Math.max(
      this.config.minLTI,
      Math.min(this.config.maxLTI, av.lti)
    );

    // Enhanced VLTI determination
    const vlti = this.shouldBeVLTI(normalizedLTI, av.sti);

    return {
      sti: normalizedSTI,
      lti: normalizedLTI,
      vlti
    };
  }

  private shouldBeVLTI(lti: number, sti: number): boolean {
    const ltiThreshold = this.config.maxLTI * this.config.vltiThreshold;
    const stiStability = Math.abs(sti) < this.config.maxSTI * 0.1;
    return lti > ltiThreshold && stiStability;
  }

  calculateImportance(atom: Atom): number {
    if (!atom.attention || !atom.truthValue) return 0;

    // Enhanced importance calculation with multiple factors
    const stiComponent = this.normalizeSTIComponent(atom.attention.sti);
    const ltiComponent = this.normalizeLTIComponent(atom.attention.lti);
    const truthComponent = this.calculateTruthValueComponent(atom);
    const useComponent = this.calculateUsageComponent(atom);

    return (stiComponent * 0.4) +
           (ltiComponent * 0.3) +
           (truthComponent * 0.2) +
           (useComponent * 0.1);
  }

  private normalizeSTIComponent(sti: number): number {
    return (sti - this.config.minSTI) / (this.config.maxSTI - this.config.minSTI);
  }

  private normalizeLTIComponent(lti: number): number {
    return lti / this.config.maxLTI;
  }

  private calculateTruthValueComponent(atom: Atom): number {
    if (!atom.truthValue) return 0;
    return atom.truthValue.strength * atom.truthValue.confidence;
  }

  private calculateUsageComponent(atom: Atom): number {
    return atom.attention?.vlti ? 1 : 0.5;
  }

  updateSTI(av: AttentionValue, stimulus: number): AttentionValue {
    // Apply non-linear stimulus response
    const response = this.calculateStimulusResponse(stimulus);
    const newSTI = av.sti + response;

    return this.normalizeAttention({
      ...av,
      sti: newSTI
    });
  }

  private calculateStimulusResponse(stimulus: number): number {
    // Sigmoid-like response function for more natural dynamics
    const amplifiedStimulus = stimulus * this.config.stimulusAmplification;
    return amplifiedStimulus / (1 + Math.abs(amplifiedStimulus) * 0.1);
  }

  updateLTI(av: AttentionValue, useCount: number): AttentionValue {
    // Non-linear LTI update based on usage patterns
    const ltiIncrement = useCount > 0 ? 
      Math.log(1 + useCount) * this.config.hebbianLearningRate : 0;
    
    const newLTI = av.lti + ltiIncrement;
    
    return this.normalizeAttention({
      ...av,
      lti: newLTI,
      vlti: this.shouldBeVLTI(newLTI, av.sti)
    });
  }
}