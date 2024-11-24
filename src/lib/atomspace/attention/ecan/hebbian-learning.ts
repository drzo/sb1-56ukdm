import { Atom, AttentionValue } from '../../types';
import { ECANConfig } from './ecan-config';

export class HebbianLearning {
  constructor(private config: ECANConfig) {}

  updateHebbianLink(
    source: Atom,
    target: Atom,
    hebbianLink: Atom | undefined
  ): Atom {
    const sourceAV = source.attention;
    const targetAV = target.attention;
    
    if (!sourceAV || !targetAV) {
      throw new Error('Both atoms must have attention values');
    }

    // Calculate co-activation based on normalized STI values
    const sourceSTI = this.normalizeSTI(sourceAV.sti);
    const targetSTI = this.normalizeSTI(targetAV.sti);
    const coActivation = Math.min(sourceSTI, targetSTI);

    // Calculate new truth value for Hebbian link
    const newStrength = hebbianLink?.truthValue
      ? this.updateHebbianStrength(hebbianLink.truthValue.strength, coActivation)
      : coActivation;

    const newConfidence = hebbianLink?.truthValue
      ? Math.min(1, hebbianLink.truthValue.confidence + this.config.hebbianLearningRate)
      : this.config.hebbianLearningRate;

    // Create or update Hebbian link
    return {
      id: hebbianLink?.id || `hebbian-${source.id}-${target.id}`,
      type: 'HebbianLink',
      name: `Hebbian(${source.name},${target.name})`,
      outgoing: [source.id, target.id],
      truthValue: {
        strength: newStrength,
        confidence: newConfidence
      },
      attention: {
        sti: (sourceAV.sti + targetAV.sti) / 2,
        lti: Math.max(sourceAV.lti, targetAV.lti),
        vlti: sourceAV.vlti || targetAV.vlti
      }
    };
  }

  private normalizeSTI(sti: number): number {
    return (sti - this.config.minSTI) / (this.config.maxSTI - this.config.minSTI);
  }

  private updateHebbianStrength(currentStrength: number, coActivation: number): number {
    const delta = coActivation - currentStrength;
    return currentStrength + (delta * this.config.hebbianLearningRate);
  }

  decayHebbianLinks(hebbianLinks: Atom[]): Atom[] {
    return hebbianLinks.map(link => ({
      ...link,
      truthValue: link.truthValue ? {
        strength: link.truthValue.strength * (1 - this.config.hebbianDecayRate),
        confidence: link.truthValue.confidence
      } : undefined
    }));
  }
}