import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DistributedAtomSpace } from '../distributed/DistributedAtomSpace';
import { QueryEngine } from '../distributed/QueryEngine';
import { NodeType } from '../types/AtomTypes';

describe('Distributed AtomSpace', () => {
  let atomspace: DistributedAtomSpace;
  let queryEngine: QueryEngine;

  beforeEach(() => {
    atomspace = new DistributedAtomSpace();
    queryEngine = new QueryEngine(atomspace);
  });

  afterEach(() => {
    atomspace.disconnect();
  });

  it('should add and retrieve atoms', async () => {
    const human = await atomspace.addNode(NodeType.CONCEPT, 'Human');
    const retrievedHuman = await atomspace.getAtom(human.getId());
    
    expect(retrievedHuman).toBeDefined();
    expect(retrievedHuman?.getType()).toBe(NodeType.CONCEPT);
  });

  it('should perform pattern matching queries', async () => {
    await atomspace.addNode(NodeType.CONCEPT, 'Human');
    await atomspace.addNode(NodeType.CONCEPT, 'Animal');
    
    const results = await queryEngine.query({
      type: NodeType.CONCEPT,
      truthValueStrength: [0.8, 1.0]
    });
    
    expect(results.length).toBe(2);
  });
});