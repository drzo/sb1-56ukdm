import { Atom, BindingMap } from '../../types';

export class MatchState {
  private visited: Set<string> = new Set();
  private depth: number = 0;
  private recursiveDepth: number = 0;
  private bindings: BindingMap = {};

  constructor(
    private atomSpace: Map<string, Atom>,
    initialBindings: BindingMap = {}
  ) {
    this.bindings = { ...initialBindings };
  }

  visitAtom(atomId: string): void {
    this.visited.add(atomId);
  }

  unvisitAtom(atomId: string): void {
    this.visited.delete(atomId);
  }

  isVisited(atomId: string): boolean {
    return this.visited.has(atomId);
  }

  incrementDepth(): void {
    this.depth++;
  }

  decrementDepth(): void {
    this.depth--;
  }

  getDepth(): number {
    return this.depth;
  }

  incrementRecursiveDepth(): void {
    this.recursiveDepth++;
  }

  getRecursiveDepth(): number {
    return this.recursiveDepth;
  }

  addBinding(variableName: string, atom: Atom): void {
    this.bindings[variableName] = atom;
  }

  getBinding(variableName: string): Atom | undefined {
    return this.bindings[variableName];
  }

  getAllBindings(): BindingMap {
    return { ...this.bindings };
  }

  getAtom(id: string): Atom | undefined {
    return this.atomSpace.get(id);
  }

  clone(): MatchState {
    const cloned = new MatchState(this.atomSpace, this.bindings);
    cloned.visited = new Set(this.visited);
    cloned.depth = this.depth;
    cloned.recursiveDepth = this.recursiveDepth;
    return cloned;
  }
}