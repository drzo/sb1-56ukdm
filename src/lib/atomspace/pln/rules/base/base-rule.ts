import { Atom, TruthValue } from '../../../types';
import { validateTruthValue } from '../../truth-values/validation';

export abstract class BasePLNRule {
  abstract readonly name: string;
  abstract readonly description: string;
  abstract readonly category: string;

  abstract applyRule(atoms: Atom[]): Atom[];

  protected validateAtoms(atoms: Atom[], requiredCount: number): boolean {
    if (atoms.length !== requiredCount) return false;
    return atoms.every(atom => this.validateAtom(atom));
  }

  protected validateAtom(atom: Atom): boolean {
    if (!atom.truthValue) return false;
    return validateTruthValue(atom.truthValue);
  }

  protected createResultAtom(
    id: string,
    type: string,
    name: string,
    outgoing: string[],
    truthValue: TruthValue,
    source: string = this.name
  ): Atom {
    return {
      id,
      type,
      name,
      outgoing,
      truthValue,
      metadata: {
        creator: source,
        timestamp: Date.now(),
        confidence: truthValue.confidence
      }
    };
  }

  protected mergeAttentionValues(atoms: Atom[]): {
    sti: number;
    lti: number;
    vlti: boolean;
  } | undefined {
    const validAttentions = atoms
      .map(atom => atom.attention)
      .filter((av): av is NonNullable<typeof av> => av !== undefined);

    if (validAttentions.length === 0) return undefined;

    return {
      sti: validAttentions.reduce((sum, av) => sum + av.sti, 0) / validAttentions.length,
      lti: Math.max(...validAttentions.map(av => av.lti)),
      vlti: validAttentions.some(av => av.vlti)
    };
  }
}