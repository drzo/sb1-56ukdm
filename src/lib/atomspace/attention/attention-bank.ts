import { Atom, AttentionValue } from '../../types/atoms';

export class AttentionBank {
  private atoms: Map<string, AttentionValue> = new Map();
  private stiRange = { min: -100, max: 100 };
  private ltiRange = { min: 0, max: 100 };

  updateAttentionValue(atom: Atom, av: AttentionValue): void {
    this.atoms.set(atom.id, {
      sti: Math.max(this.stiRange.min, Math.min(this.stiRange.max, av.sti)),
      lti: Math.max(this.ltiRange.min, Math.min(this.ltiRange.max, av.lti)),
      vlti: av.vlti
    });
  }

  getAttentionValue(atomId: string): AttentionValue | undefined {
    return this.atoms.get(atomId);
  }

  removeAtom(atomId: string): void {
    this.atoms.delete(atomId);
  }

  // Attention allocation and spreading
  stimulateAtom(atomId: string, stimulus: number): void {
    const av = this.atoms.get(atomId);
    if (av) {
      this.updateAttentionValue({ id: atomId } as Atom, {
        ...av,
        sti: av.sti + stimulus
      });
    }
  }

  decayAttentionValues(decayFactor: number): void {
    for (const [atomId, av] of this.atoms.entries()) {
      if (!av.vlti) { // Don't decay VLTI atoms
        this.updateAttentionValue({ id: atomId } as Atom, {
          ...av,
          sti: av.sti * decayFactor,
          lti: av.lti * Math.sqrt(decayFactor)
        });
      }
    }
  }

  getTopSTIAtoms(limit: number): [string, AttentionValue][] {
    return Array.from(this.atoms.entries())
      .sort(([, a], [, b]) => b.sti - a.sti)
      .slice(0, limit);
  }
}