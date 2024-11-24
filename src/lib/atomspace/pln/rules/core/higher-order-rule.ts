import { Atom, TruthValue } from '../../../types';
import { BasePLNRule } from '../base/base-rule';

export class HigherOrderRule extends BasePLNRule {
  readonly name = 'HigherOrder';
  readonly description = 'Handle higher-order reasoning patterns';
  readonly category = 'Core';
  readonly computationalCost = 0.9;

  applyRule(atoms: Atom[]): Atom[] {
    if (!this.validateAtoms(atoms, 2)) return [];
    
    const [pattern, target] = atoms;
    if (!pattern.truthValue || !target.truthValue) return [];

    // Calculate higher-order inference strength
    const matchDegree = this.calculatePatternMatch(pattern, target);
    const higherOrderTv: TruthValue = {
      strength: pattern.truthValue.strength * matchDegree,
      confidence: Math.min(
        pattern.truthValue.confidence,
        target.truthValue.confidence
      ) * 0.8
    };

    return [this.createResultAtom(
      `higher-order-${pattern.id}-${target.id}`,
      'HigherOrderLink',
      `HigherOrder(${pattern.name},${target.name})`,
      [pattern.id, target.id],
      higherOrderTv
    )];
  }

  private calculatePatternMatch(pattern: Atom, target: Atom): number {
    let score = 0;
    
    // Type compatibility
    if (pattern.type === target.type) {
      score += 0.4;
    }

    // Structure similarity
    if (this.compareStructure(pattern, target)) {
      score += 0.3;
    }

    // Truth value similarity
    if (pattern.truthValue && target.truthValue) {
      const tvDiff = Math.abs(pattern.truthValue.strength - target.truthValue.strength);
      score += 0.3 * (1 - tvDiff);
    }

    return Math.min(1, Math.max(0, score));
  }

  private compareStructure(a: Atom, b: Atom): boolean {
    if (!a.outgoing || !b.outgoing) return false;
    if (a.outgoing.length !== b.outgoing.length) return false;
    
    return a.outgoing.every((id, i) => b.outgoing![i] === id);
  }

  validate(atoms: Atom[]): boolean {
    return super.validateAtoms(atoms, 2) &&
           atoms.every(atom => atom.truthValue !== undefined);
  }
}