import { DeclarativeMemory } from '../memory/declarative.js';
import { EpisodicMemory } from '../memory/episodic.js';
import { SemanticMemory } from '../memory/semantic.js';
import { ProceduralMemory } from '../memory/procedural.js';

export class IntegratedMemory {
  constructor() {
    this.declarative = new DeclarativeMemory();
    this.episodic = new EpisodicMemory();
    this.semantic = new SemanticMemory();
    this.procedural = new ProceduralMemory();
  }

  // Process new information across memory systems
  async process(input) {
    // 1. Create declarative facts
    const facts = this.extractFacts(input);
    facts.forEach(fact => {
      this.declarative.assertFact(fact.predicate, fact.args);
    });

    // 2. Record episodic event
    const episode = this.episodic.recordEpisode({
      type: 'input_processing',
      content: input,
      facts: facts
    });

    // 3. Update semantic knowledge
    const concepts = this.extractConcepts(input);
    concepts.forEach(concept => {
      this.semantic.addConcept(
        concept.name,
        concept.properties,
        concept.proof
      );
    });

    // 4. Execute relevant procedures
    const procedures = this.identifyProcedures(input);
    for (const proc of procedures) {
      await this.procedural.execute(proc.name, proc.params);
    }

    return {
      facts,
      episode,
      concepts,
      procedures
    };
  }

  // Extract declarative facts from input
  extractFacts(input) {
    // Simple fact extraction based on patterns
    const facts = [];
    
    // Example pattern: "X is Y" -> fact(is, [X, Y])
    const isPattern = /(\w+) is (\w+)/g;
    let match;
    
    while ((match = isPattern.exec(input)) !== null) {
      facts.push({
        predicate: 'is',
        args: [match[1], match[2]]
      });
    }

    return facts;
  }

  // Extract semantic concepts from input
  extractConcepts(input) {
    const concepts = [];
    
    // Example: Extract noun phrases as concepts
    const nounPattern = /\b([A-Z][a-z]+)\b/g;
    let match;
    
    while ((match = nounPattern.exec(input)) !== null) {
      concepts.push({
        name: match[1],
        properties: {
          type: 'entity',
          context: input
        }
      });
    }

    return concepts;
  }

  // Identify relevant procedures
  identifyProcedures(input) {
    const procedures = [];
    
    // Example: Look for action keywords
    const actionPattern = /(create|update|delete) (\w+)/g;
    let match;
    
    while ((match = actionPattern.exec(input)) !== null) {
      procedures.push({
        name: `${match[1]}_procedure`,
        params: {
          target: match[2],
          context: input
        }
      });
    }

    return procedures;
  }

  // Query across memory systems
  query(params) {
    const results = {
      declarative: [],
      episodic: [],
      semantic: [],
      procedural: []
    };

    // Query declarative facts
    if (params.predicate) {
      results.declarative = this.declarative.query(
        params.predicate,
        params.args || []
      );
    }

    // Find relevant episodes
    if (params.context) {
      this.episodic.setContext(params.context);
      const dummyEpisode = { context: params.context };
      results.episodic = this.episodic.findSimilarEpisodes(
        dummyEpisode,
        params.threshold
      );
    }

    // Query semantic concepts
    if (params.concept) {
      const concept = this.semantic.concepts.get(params.concept);
      if (concept) {
        results.semantic.push(concept);
      }
    }

    // Get procedure status
    if (params.procedure) {
      const procedure = this.procedural.procedures.get(params.procedure);
      if (procedure) {
        results.procedural.push(procedure);
      }
    }

    return results;
  }
}