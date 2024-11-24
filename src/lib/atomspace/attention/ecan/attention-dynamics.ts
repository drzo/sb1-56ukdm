import { Atom, AttentionValue } from '../../types';
import { ECANConfig } from './ecan-config';

export class AttentionDynamics {
  constructor(private config: ECANConfig) {}

  decayAttention(av: AttentionValue): AttentionValue {
    return {
      sti: av.sti * (1 - this.config.attentionDecayRate),
      lti: av.lti * (1 - this.config.attentionDecayRate / 2),
      vlti: av.vlti
    };
  }

  normalizeAttention(av: AttentionValue): AttentionValue {
    return {
      sti: Math.max(this.config.minSTI, 
           Math.min(this.config.maxSTI, av.sti)),
      lti: Math.max(this.config.minLTI,
           Math.min(this.config.maxLTI, av.lti)),
      vlti: av.vlti
    };
  }

  calculateImportance(atom: Atom): number {
    if (!atom.attention || !atom.truthValue) return 0;

    const stiWeight = 0.7;
    const ltiWeight = 0.2;
    const truthWeight = 0.1;

    return (atom.attention.sti * stiWeight) +
           (atom.attention.lti * ltiWeight) +
           ((atom.truthValue.strength * atom.truthValue.confidence) * truthWeight);
  }

  updateSTI(av: AttentionValue, stimulus: number): AttentionValue {
    const newSTI = av.sti + stimulus;
    return this.normalizeAttention({
      ...av,
      sti: newSTI
    });
  }

  updateLTI(av: AttentionValue, useCount: number): AttentionValue {
    const ltiIncrement = useCount > 0 ? Math.log(useCount) : 0;
    const newLTI = av.lti + ltiIncrement;
    
    return this.normalizeAttention({
      ...av,
      lti: newLTI,
      vlti: newLTI > this.config.maxLTI * 0.8
    });
  }
}