export class PathTracker {
  private currentPath: string[] = [];
  private cyclicPaths: string[] = [];

  pushAtom(atomId: string): void {
    this.currentPath.push(atomId);
    this.checkForCycles();
  }

  popAtom(): void {
    this.currentPath.pop();
  }

  getCurrentPath(): string[] {
    return [...this.currentPath];
  }

  getCyclicPaths(): string[] {
    return [...this.cyclicPaths];
  }

  hasCycles(): boolean {
    return this.cyclicPaths.length > 0;
  }

  private checkForCycles(): void {
    const currentAtom = this.currentPath[this.currentPath.length - 1];
    const previousPath = this.currentPath.slice(0, -1);
    
    if (previousPath.includes(currentAtom)) {
      const cycle = this.currentPath.join('->');
      if (!this.cyclicPaths.includes(cycle)) {
        this.cyclicPaths.push(cycle);
      }
    }
  }

  clone(): PathTracker {
    const cloned = new PathTracker();
    cloned.currentPath = [...this.currentPath];
    cloned.cyclicPaths = [...this.cyclicPaths];
    return cloned;
  }
}