import { Atom, TruthValue } from '../../types';
import { HebbianLearning } from '../../attention/ecan/core/hebbian/hebbian-learning';
import { PatternMatcher } from '../../matching/core/pattern-matcher';

export class AssociativeNetwork {
  constructor(
    private hebbianLearning: HebbianLearning,
    private patternMatcher: PatternMatcher,
    private atomSpace: Map<string, Atom>
  ) {}

  strengthenAssociation(atom1: Atom, atom2: Atom): void {
    const hebbianLink = this.hebbianLearning.updateHebbianLink(
      atom1,
      atom2,
      this.findExistingLink(atom1, atom2)
    );

    this.atomSpace.set(hebbianLink.id, hebbianLink);
    this.updatePatternIndices(hebbianLink);
  }

  findAssociations(seed: Atom, minStrength: number = 0.5): Atom[] {
    const hebbianLinks = this.getHebbianLinks(seed);
    
    return hebbianLinks
      .filter(link => link.truthValue.strength > minStrength)
      .map(link => this.getAssociatedAtom(link, seed))
      .filter((atom): atom is Atom => atom !== undefined);
  }

  private findExistingLink(atom1: Atom, atom2: Atom): Atom | undefined {
    return Array.from(this.atomSpace.values())
      .find(atom => 
        atom.type === 'HebbianLink' &&
        atom.outgoing?.includes(atom1.id) &&
        atom.outgoing?.includes(atom2.id)
      );
  }

  private getHebbianLinks(atom: Atom): Atom[] {
    return Array.from(this.atomSpace.values())
      .filter(other => 
        other.type === 'HebbianLink' &&
        other.outgoing?.includes(atom.id)
      );
  }

  private getAssociatedAtom(link: Atom, source: Atom): Atom | undefined {
    const targetId = link.outgoing?.find(id => id !== source.id);
    return targetId ? this.atomSpace.get(targetId) : undefined;
  }

  private updatePatternIndices(link: Atom): void {
    const pattern = {
      type: 'HebbianLink',
      outgoing: link.outgoing
    };
    this.patternMatcher.updatePatternIndex(pattern);
  }
}