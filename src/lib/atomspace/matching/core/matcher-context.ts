import { Atom, MatchContext } from '../../../types';

export class MatcherContext {
  private visited: Set<string> = new Set();
  private depth: number = 0;

  constructor(private atomSpace: Map<string, Atom>) {}

  isAtomVisited(atomId: string): boolean {
    return this.visited.has(atomId);
  }

  visitAtom(atomId: string): void {
    this.visited.add(atomId);
  }

  unvisitAtom(atomId: string): void {
    this.visited.delete(atomId);
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

  getAtomSpace(): Map<string, Atom> {
    return this.atomSpace;
  }

  getVisited(): Set<string> {
    return new Set(this.visited);
  }

  clone(): MatcherContext {
    const cloned = new MatcherContext(this.atomSpace);
    cloned.visited = new Set(this.visited);
    cloned.depth = this.depth;
    return cloned;
  }

  toMatchContext(): MatchContext {
    return {
      atomSpace: this.atomSpace,
      visited: this.visited,
      depth: this.depth
    };
  }
}