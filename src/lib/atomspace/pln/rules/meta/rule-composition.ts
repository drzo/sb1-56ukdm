import { Atom, TruthValue } from '../../../types';
import { BasePLNRule } from '../base/base-rule';

export class RuleCompositionRule extends BasePLNRule {
  readonly name = 'RuleComposition';
  readonly description = 'Compose two rules to create a new compound rule';
  readonly category = 'Meta';

  applyRule(atoms: Atom[]): Atom[] {
    if (!this.validateAtoms(atoms, 2)) return [];
    
    const [rule1, rule2] = atoms;
    if (!rule1.truthValue || !rule2.truthValue) return [];

    // Create composite rule
    const compositeTv: TruthValue = {
      strength: Math.min(rule1.truthValue.strength, rule2.truthValue.strength),
      confidence: rule1.truthValue.confidence * rule2.truthValue.confidence * 0.9
    };

    return [{
      id: `compose-${rule1.id}-${rule2.id}`,
      type: 'CompositeRule',
      name: `Composition(${rule1.name},${rule2.name})`,
      outgoing: [rule1.id, rule2.id],
      truthValue: compositeTv,
      metadata: {
        creator: this.name,
        timestamp: Date.now(),
        source: 'RuleComposition'
      }
    }];
  }
}