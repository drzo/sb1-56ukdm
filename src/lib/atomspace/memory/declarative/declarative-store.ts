import { Atom, Pattern } from '../../types';
import { SemanticMemory } from '../semantic/semantic-memory';
import { WorkingMemory } from '../working/working-memory';

export class DeclarativeStore {
  constructor(
    private atomSpace: Map<string, Atom>,
    private semanticMemory: SemanticMemory,
    private workingMemory: WorkingMemory
  ) {}

  storeKnowledge(fact: Atom): void {
    this.atomSpace.set(fact.id, fact);
    this.semanticMemory.createRelationships(fact);
    this.workingMemory.focusAttention(fact);
  }

  retrieveKnowledge(query: Pattern): Atom[] {
    const semanticMatches = this.semanticMemory.findRelated(query);
    const declarativeMatches = semanticMatches.filter(atom => 
      this.isDeclarativeKnowledge(atom)
    );

    declarativeMatches.forEach(match => 
      this.workingMemory.focusAttention(match)
    );

    return declarativeMatches;
  }

  private isDeclarativeKnowledge(atom: Atom): boolean {
    return atom.type === 'DeclarativeNode' || 
           atom.type === 'ConceptNode' ||
           atom.type === 'PropositionNode';
  }
}