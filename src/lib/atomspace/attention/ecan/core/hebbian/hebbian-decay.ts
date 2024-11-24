import { Atom } from '../../../../types';
import { ECANConfig } from '../../config/ecan-config';

export class HebbianDecay {
  constructor(private config: ECANConfig) {}

  decayHebbianLinks(links: Atom[]): Map<string, Atom> {
    const updates = new Map<string, Atom>();

    links.forEach(link => {
      if (link.type !== 'HebbianLink' || !link.truthValue) return;

      const decayedStrength = this.decayStrength(link.truthValue.strength);
      
      updates.set(link.id, {
        ...link,
        truthValue: {
          ...link.truthValue,
          strength: decayedStrength
        }
      });
    });

    return updates;
  }

  private decayStrength(strength: number): number {
    return strength * (1 - this.config.hebbianDecayRate);
  }

  shouldRemoveLink(link: Atom): boolean {
    return link.truthValue !== undefined &&
           link.truthValue.strength < 0.1 &&
           link.truthValue.confidence < 0.1;
  }
}