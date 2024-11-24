import { Atom } from '../../types';

export class MatchContext {
  private visited: Set<string> = new Set();
  private depth: number = 0;
  private recursiveDepth: number = 0;
  private cyclicPaths: string[] = [];
  private currentPath: string[] = [];

  constructor(private atomSpace: Map<string, Atom>) {}

  isAtomVisited(atomId: string): boolean {
    return this.visited.has(atomId);
  }

  visitAtom(atomId: string): void {
    this.visited.add(atomId);
    this.currentPath.push(atomId);
    
    if (this.isPathCyclic()) {
      this.cyclicPaths.push(this.getCurrentPath());
    }
  }

  unvisitAtom(atomId: string): void {
    this.visited.delete(atomId);
    this.currentPath.pop();
  }

  incrementDepth(): void {
    this.depth++;
  }

  decrementDepth(): void {
    this.depth--;
  }

  incrementRecursiveDepth(): void {
    this.recursiveDepth++;
  }

  getDepth(): number {
    return this.depth;
  }

  getRecursiveDepth(): number {
    return this.recursiveDepth;
  }

  getAtomSpace(): Map<string, Atom> {
    return this.atomSpace;
  }

  getVisited(): Set<string> {
    return new Set(this.visited);
  }

  getCyclicPaths(): string[] {
    return [...this.cyclicPaths];
  }

  hasCycles(): boolean {
    return this.cyclicPaths.length > 0;
  }

  private getCurrentPath(): string {
    return this.currentPath.join('->');
  }

  private isPathCyclic(): boolean {
    const currentAtom = this.currentPath[this.currentPath.length - 1];
    return this.currentPath.slice(0, -1).includes(currentAtom);
  }

  clone(): MatchContext {
    const cloned = new MatchContext(this.atomSpace);
    cloned.visited = new Set(this.visited);
    cloned.depth = this.depth;
    cloned.recursiveDepth = this.recursiveDepth;
    cloned.cyclicPaths = [...this.cyclicPaths];
    cloned.currentPath = [...this.currentPath];
    return cloned;
  }
}