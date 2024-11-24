import { Atom, AttentionValue } from '../../../../types';
import { ECANConfig } from '../../config/ecan-config';
import { HebbianStrengthCalculator } from './hebbian-strength-calculator';
import { HebbianConfidenceCalculator } from './hebbian-confidence-calculator';
import { HebbianAttentionCalculator } from './hebbian-attention-calculator';

export class HebbianLearning {
  private strengthCalculator: HebbianStrengthCalculator;
  private confidenceCalculator: HebbianConfidenceCalculator;
  private attentionCalculator: HebbianAttentionCalculator;

  constructor(private config: ECANConfig) {
    this.strengthCalculator = new HebbianStrengthCalculator(config);
    this.confidenceCalculator = new HebbianConfidenceCalculator(config);
    this.attentionCalculator = new HebbianAttentionCalculator(config);
  }

  updateHebbianLinks(atoms: Atom[]): Map<string, Atom> {
    const updates = new Map<string, Atom>();
    
    // Find co-activated atom pairs
    const coActivatedPairs = this.findCoActivatedPairs(atoms);
    
    // Update or create Hebbian links
    coActivatedPairs.forEach(([source, target]) => {
      const existingLink = this.findHebbianLink(atoms, source, target);
      const updatedLink = this.updateHebbianLink(source, target, existingLink);
      updates.set(updatedLink.id, updatedLink);
    });

    return updates;
  }

  private findCoActivatedPairs(atoms: Atom[]): [Atom, Atom][] {
    const pairs: [Atom, Atom][] = [];
    const activeAtoms = atoms.filter(atom => 
      atom.attention && atom.attention.sti > 0
    );

    for (let i = 0; i < activeAtoms.length; i++) {
      for (let j = i + 1; j < activeAtoms.length; j++) {
        if (this.areCoActivated(activeAtoms[i], activeAtoms[j])) {
          pairs.push([activeAtoms[i], activeAtoms[j]]);
        }
      }
    }

    return pairs;
  }

  private areCoActivated(atom1: Atom, atom2: Atom): boolean {
    if (!atom1.attention || !atom2.attention) return false;
    
    const normalizedSTI1 = (atom1.attention.sti + 100) / 200;
    const normalizedSTI2 = (atom2.attention.sti + 100) / 200;
    
    return normalizedSTI1 > 0.5 && normalizedSTI2 > 0.5;
  }

  private findHebbianLink(atoms: Atom[], source: Atom, target: Atom): Atom | undefined {
    return atoms.find(atom =>
      atom.type === 'HebbianLink' &&
      atom.outgoing?.includes(source.id) &&
      atom.outgoing?.includes(target.id)
    );
  }

  private updateHebbianLink(
    source: Atom,
    target: Atom,
    existingLink?: Atom
  ): Atom {
    const newStrength = this.strengthCalculator.calculateStrength(
      source,
      target,
      existingLink
    );

    const newConfidence = this.confidenceCalculator.calculateConfidence(
      source,
      target,
      existingLink
    );

    const newAttention = this.attentionCalculator.calculateAttention(
      source,
      target
    );

    return {
      id: existingLink?.id || `hebbian-${source.id}-${target.id}`,
      type: 'HebbianLink',
      name: `Hebbian(${source.name},${target.name})`,
      outgoing: [source.id, target.id],
      truthValue: {
        strength: newStrength,
        confidence: newConfidence
      },
      attention: newAttention
    };
  }
}