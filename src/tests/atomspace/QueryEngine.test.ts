import { describe, it, expect, beforeEach } from 'vitest';
import { AtomSpaceCore } from '../../atomspace/core/AtomSpaceCore';
import { QueryEngine } from '../../atomspace/query/QueryEngine';
import { NodeType, LinkType } from '../../types/AtomTypes';

describe('QueryEngine', () => {
  let atomspace: AtomSpaceCore;
  let queryEngine: QueryEngine;

  beforeEach(() => {
    atomspace = new AtomSpaceCore();
    queryEngine = new QueryEngine(atomspace);
  });

  it('should execute basic queries', async () => {
    atomspace.addNode(NodeType.CONCEPT, 'Human', { strength: 0.9, confidence: 0.8 });
    atomspace.addNode(NodeType.CONCEPT, 'Animal', { strength: 0.8, confidence: 0.7 });

    const result = await queryEngine.query({
      type: NodeType.CONCEPT,
      truthValue: {
        strength: [0.85, 1.0]
      }
    });

    expect(result.atoms).toHaveLength(1);
    expect(result.matchCount).toBe(1);
    expect(result.executionTime).toBeGreaterThan(0);
  });

  it('should find similar atoms', async () => {
    const human1 = atomspace.addNode(NodeType.CONCEPT, 'Human1', {
      strength: 0.9,
      confidence: 0.9
    });

    atomspace.addNode(NodeType.CONCEPT, 'Human2', {
      strength: 0.85,
      confidence: 0.85
    });

    atomspace.addNode(NodeType.CONCEPT, 'Different', {
      strength: 0.2,
      confidence: 0.2
    });

    const similar = await queryEngine.findSimilar(human1, 0.8);
    expect(similar).toHaveLength(2); // includes the original atom
  });

  it('should analyze atom sets', async () => {
    atomspace.addNode(NodeType.CONCEPT, 'Node1', { strength: 0.9, confidence: 0.9 });
    atomspace.addNode(NodeType.CONCEPT, 'Node2', { strength: 0.7, confidence: 0.7 });
    atomspace.addNode(NodeType.PREDICATE, 'Pred1', { strength: 0.8, confidence: 0.8 });

    const atoms = atomspace.getAtomsByType(NodeType.CONCEPT);
    const analysis = await queryEngine.analyze(atoms);

    expect(analysis.truthValueStats.meanStrength).toBeCloseTo(0.8, 1);
    expect(analysis.typeDistribution[NodeType.CONCEPT]).toBe(2);
  });
});