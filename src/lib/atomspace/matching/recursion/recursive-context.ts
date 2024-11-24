import { MatchContext } from '../../../types';

export class RecursiveContext {
  private visitedPaths: Set<string> = new Set();
  private cyclicPaths: string[] = [];
  private currentPath: string[] = [];

  constructor(private context: MatchContext) {}

  pushPath(atomId: string): void {
    this.currentPath.push(atomId);
    const path = this.getCurrentPath();
    
    if (this.visitedPaths.has(path)) {
      this.cyclicPaths.push(path);
    } else {
      this.visitedPaths.add(path);
    }
  }

  popPath(): void {
    this.currentPath.pop();
  }

  getCurrentPath(): string {
    return this.currentPath.join('->');
  }

  hasCycle(): boolean {
    return this.cyclicPaths.length > 0;
  }

  getCyclicPaths(): string[] {
    return [...this.cyclicPaths];
  }

  getVisitedPaths(): Set<string> {
    return new Set(this.visitedPaths);
  }

  getDepth(): number {
    return this.currentPath.length;
  }

  isAtomVisited(atomId: string): boolean {
    return this.currentPath.includes(atomId);
  }
}