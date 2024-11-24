import { Atom, TruthValue } from '../../../types';
import { BasePLNRule } from '../base/base-rule';

export class RuleGeneralizationRule extends BasePLNRule {
  readonly name = 'RuleGeneralization';
  readonly description = 'Generate more general rules from specific ones';
  readonly category = 'Meta';

  applyRule(atoms: Atom[]): Atom[] {
    if (!this.validateAtoms(atoms, 1)) return [];
    
    const [specificRule] = atoms;
    if (!specificRule.truthValue) return [];

    // Create generalized rule with reduced confidence
    const generalizedTv: TruthValue = {
      strength: specificRule.truthValue.strength * 0.9,
      confidence: specificRule.truthValue.confidence * 0.7
    };

    return [{
      id: `general-${specificRule.id}`,
      type: 'GeneralRule',
      name: `Generalization(${specificRule.name})`,
      outgoing: [specificRule.id],
      truthValue: generalizedTv,
      metadata: {
        creator: this.name,
        timestamp: Date.now(),
        source: 'RuleGeneralization'
      }
    }];
  }
}