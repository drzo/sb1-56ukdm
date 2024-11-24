// Pattern Language implementation based on Christopher Alexander's concepts
export class PatternLanguage {
  constructor() {
    this.patterns = new Map();
    this.relationships = new Map();
  }

  // Add a community pattern
  addPattern(id, {
    name,
    context,
    problem,
    solution,
    forces = [],
    examples = []
  }) {
    this.patterns.set(id, {
      name,
      context,
      problem,
      solution,
      forces,
      examples,
      connections: new Set()
    });
  }

  // Connect related patterns
  connectPatterns(pattern1Id, pattern2Id, relationship) {
    const p1 = this.patterns.get(pattern1Id);
    const p2 = this.patterns.get(pattern2Id);

    if (p1 && p2) {
      p1.connections.add(pattern2Id);
      p2.connections.add(pattern1Id);
      
      const key = [pattern1Id, pattern2Id].sort().join(':');
      this.relationships.set(key, relationship);
    }
  }

  // Get pattern hierarchy/network
  getPatternNetwork() {
    const network = [];
    for (const [id, pattern] of this.patterns) {
      network.push({
        id,
        name: pattern.name,
        connections: Array.from(pattern.connections).map(connId => ({
          id: connId,
          relationship: this.getRelationship(id, connId)
        }))
      });
    }
    return network;
  }

  getRelationship(p1Id, p2Id) {
    const key = [p1Id, p2Id].sort().join(':');
    return this.relationships.get(key);
  }
}