import { Atom, Pattern, TruthValue } from '../../types';

export class SemanticMemory {
  private relationships: Map<string, Relationship> = new Map();

  constructor(private atomSpace: Map<string, Atom>) {}

  createRelationships(concept: Atom): void {
    const relatedConcepts = this.findRelatedConcepts(concept);
    
    relatedConcepts.forEach(related => {
      const relationship = this.calculateRelationship(concept, related);
      this.relationships.set(
        `${concept.id}-${related.id}`,
        relationship
      );
    });
  }

  findRelated(query: Pattern): Atom[] {
    const matches = Array.from(this.relationships.values())
      .filter(rel => this.matchesPattern(rel, query))
      .sort((a, b) => b.strength - a.strength)
      .map(rel => this.atomSpace.get(rel.targetId))
      .filter((atom): atom is Atom => atom !== undefined);

    return this.rankByRelevance(matches, query);
  }

  private findRelatedConcepts(concept: Atom): Atom[] {
    return Array.from(this.atomSpace.values())
      .filter(atom => 
        atom.id !== concept.id &&
        this.areConceptsRelated(concept, atom)
      );
  }

  private calculateRelationship(source: Atom, target: Atom): Relationship {
    const sharedProperties = this.getSharedProperties(source, target);
    const strength = sharedProperties.length / 
                    Math.max(this.getProperties(source).length,
                            this.getProperties(target).length);

    return {
      sourceId: source.id,
      targetId: target.id,
      type: this.determineRelationType(source, target),
      properties: sharedProperties,
      strength,
      confidence: Math.min(source.truthValue.confidence,
                         target.truthValue.confidence)
    };
  }

  private getProperties(concept: Atom): string[] {
    return Array.from(this.atomSpace.values())
      .filter(atom => 
        atom.type === 'PropertyLink' &&
        atom.outgoing?.includes(concept.id)
      )
      .map(atom => atom.id);
  }

  private getSharedProperties(a: Atom, b: Atom): string[] {
    const propsA = new Set(this.getProperties(a));
    return this.getProperties(b)
      .filter(prop => propsA.has(prop));
  }

  private determineRelationType(source: Atom, target: Atom): RelationType {
    if (this.isSubsetOf(source, target)) return 'inheritance';
    if (this.isSimilarTo(source, target)) return 'similarity';
    return 'association';
  }

  private isSubsetOf(subset: Atom, superset: Atom): boolean {
    const subsetProps = new Set(this.getProperties(subset));
    return this.getProperties(superset)
      .every(prop => subsetProps.has(prop));
  }

  private isSimilarTo(a: Atom, b: Atom): boolean {
    const shared = this.getSharedProperties(a, b).length;
    const total = new Set([
      ...this.getProperties(a),
      ...this.getProperties(b)
    ]).size;
    return shared / total > 0.7;
  }

  private matchesPattern(rel: Relationship, pattern: Pattern): boolean {
    if (pattern.type && rel.type !== pattern.type) return false;
    
    if (pattern.constraints) {
      return Object.entries(pattern.constraints)
        .every(([key, value]) => rel[key as keyof Relationship] === value);
    }

    return true;
  }

  private rankByRelevance(matches: Atom[], query: Pattern): Atom[] {
    return matches.sort((a, b) => {
      const scoreA = this.calculateRelevanceScore(a, query);
      const scoreB = this.calculateRelevanceScore(b, query);
      return scoreB - scoreA;
    });
  }

  private calculateRelevanceScore(atom: Atom, query: Pattern): number {
    const typeMatch = query.type ? atom.type === query.type ? 1 : 0 : 0.5;
    const truthValue = atom.truthValue.strength * atom.truthValue.confidence;
    return (typeMatch + truthValue) / 2;
  }
}

interface Relationship {
  sourceId: string;
  targetId: string;
  type: RelationType;
  properties: string[];
  strength: number;
  confidence: number;
}

type RelationType = 'inheritance' | 'similarity' | 'association';