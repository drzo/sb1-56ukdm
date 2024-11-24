import type { Pattern } from '../types/patterns';

export class PatternLanguage {
  private patterns: Map<number, Pattern>;
  private connections: Map<string, string>; // Stores relationship types between patterns

  constructor() {
    this.patterns = new Map();
    this.connections = new Map();
  }

  addPattern(pattern: Pattern) {
    this.patterns.set(pattern.id, pattern);
    
    // Create connections for broader patterns
    pattern.broaderPatterns.forEach(broaderId => {
      const key = `${broaderId}-${pattern.id}`;
      this.connections.set(key, 'broader');
    });

    // Create connections for narrower patterns
    pattern.narrowerPatterns.forEach(narrowerId => {
      const key = `${pattern.id}-${narrowerId}`;
      this.connections.set(key, 'narrower');
    });
  }

  getPattern(id: number): Pattern | undefined {
    return this.patterns.get(id);
  }

  getBroaderPatterns(patternId: number): Pattern[] {
    const pattern = this.patterns.get(patternId);
    if (!pattern) return [];
    
    return pattern.broaderPatterns
      .map(id => this.patterns.get(id))
      .filter((p): p is Pattern => p !== undefined);
  }

  getNarrowerPatterns(patternId: number): Pattern[] {
    const pattern = this.patterns.get(patternId);
    if (!pattern) return [];
    
    return pattern.narrowerPatterns
      .map(id => this.patterns.get(id))
      .filter((p): p is Pattern => p !== undefined);
  }

  getRelationshipType(fromId: number, toId: number): string | undefined {
    return this.connections.get(`${fromId}-${toId}`);
  }

  getAllPatterns(): Pattern[] {
    return Array.from(this.patterns.values());
  }

  // Get patterns in hierarchical order (top-level patterns first)
  getPatternsHierarchy(): Pattern[] {
    const visited = new Set<number>();
    const result: Pattern[] = [];

    const visit = (patternId: number) => {
      if (visited.has(patternId)) return;
      
      const pattern = this.patterns.get(patternId);
      if (!pattern) return;

      // Visit broader patterns first
      pattern.broaderPatterns.forEach(visit);

      visited.add(patternId);
      result.push(pattern);
    };

    // Start with patterns that have no broader patterns
    Array.from(this.patterns.values())
      .filter(p => p.broaderPatterns.length === 0)
      .forEach(p => visit(p.id));

    // Visit remaining patterns
    Array.from(this.patterns.values())
      .forEach(p => visit(p.id));

    return result;
  }
}