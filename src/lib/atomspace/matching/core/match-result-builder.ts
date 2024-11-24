import { Atom, BindingMap, MatchResult } from '../../../types';

export class MatchResultBuilder {
  private matchedAtoms: Atom[] = [];
  private bindings: BindingMap = {};
  private depth: number = 0;
  private recursiveDepth?: number;
  private cyclicPaths?: string[];

  addMatchedAtom(atom: Atom): this {
    this.matchedAtoms.push(atom);
    return this;
  }

  addMatchedAtoms(atoms: Atom[]): this {
    this.matchedAtoms.push(...atoms);
    return this;
  }

  addBinding(variableName: string, atom: Atom): this {
    this.bindings[variableName] = atom;
    return this;
  }

  mergeBindings(otherBindings: BindingMap): this {
    this.bindings = { ...this.bindings, ...otherBindings };
    return this;
  }

  setDepth(depth: number): this {
    this.depth = depth;
    return this;
  }

  setRecursiveDepth(depth: number): this {
    this.recursiveDepth = depth;
    return this;
  }

  setCyclicPaths(paths: string[]): this {
    this.cyclicPaths = paths;
    return this;
  }

  build(): MatchResult {
    const result: MatchResult = {
      matched: true,
      matchedAtoms: this.matchedAtoms,
      bindings: this.bindings,
      depth: this.depth
    };

    if (this.recursiveDepth !== undefined) {
      result.recursiveDepth = this.recursiveDepth;
    }

    if (this.cyclicPaths) {
      result.cyclicPaths = this.cyclicPaths;
    }

    return result;
  }

  static createEmpty(): MatchResult {
    return {
      matched: false,
      matchedAtoms: [],
      bindings: {},
      depth: 0
    };
  }
}