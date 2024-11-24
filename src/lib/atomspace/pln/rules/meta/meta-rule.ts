import { Atom, TruthValue } from '../../../types';
import { BasePLNRule } from '../base/base-rule';

export class MetaRule extends BasePLNRule {
  readonly name = 'Meta';
  readonly description = 'Apply rules to other rules to generate new rules';
  readonly category = 'Meta';

  applyRule(atoms: Atom[]): Atom[] {
    if (!this.validateAtoms(atoms, 2)) return [];
    
    const [ruleAtom, targetAtom] = atoms;
    if (!ruleAtom.truthValue || !targetAtom.truthValue) return [];

    // Generate new rule by combining existing rule with target
    const metaTv: TruthValue = {
      strength: ruleAtom.truthValue.strength * targetAtom.truthValue.strength,
      confidence: ruleAtom.truthValue.confidence * targetAtom.truthValue.confidence * 0.8
    };

    return [{
      id: `meta-${ruleAtom.id}-${targetAtom.id}`,
      type: 'MetaRule',
      name: `Meta(${ruleAtom.name},${targetAtom.name})`,
      outgoing: [ruleAtom.id, targetAtom.id],
      truthValue: metaTv,
      metadata: {
        creator: this.name,
        timestamp: Date.now(),
        source: 'MetaRule'
      }
    }];
  }
}