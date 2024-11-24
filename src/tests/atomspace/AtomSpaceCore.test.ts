import { describe, it, expect, beforeEach } from 'vitest';
import { AtomSpaceCore } from '../../atomspace/core/AtomSpaceCore';
import { NodeType, LinkType } from '../../types/AtomTypes';

describe('AtomSpaceCore', () => {
  let atomspace: AtomSpaceCore;

  beforeEach(() => {
    atomspace = new AtomSpaceCore();
  });

  it('should add and retrieve nodes', () => {
    const node = atomspace.addNode(NodeType.CONCEPT, 'Human', {
      strength: 0.9,
      confidence: 0.8
    });

    const retrieved = atomspace.getAtom(node.getId());
    expect(retrieved).toBeDefined();
    expect(retrieved?.getType()).toBe(NodeType.CONCEPT);
    expect(retrieved?.getTruthValue().strength).toBe(0.9);
  });

  it('should add and retrieve links', () => {
    const human = atomspace.addNode(NodeType.CONCEPT, 'Human');
    const mammal = atomspace.addNode(NodeType.CONCEPT, 'Mammal');
    const link = atomspace.addLink(LinkType.INHERITANCE, [human, mammal]);

    const retrieved = atomspace.getAtom(link.getId());
    expect(retrieved).toBeDefined();
    expect(retrieved?.getType()).toBe(LinkType.INHERITANCE);
  });

  it('should track incoming sets', () => {
    const human = atomspace.addNode(NodeType.CONCEPT, 'Human');
    const mammal = atomspace.addNode(NodeType.CONCEPT, 'Mammal');
    const link = atomspace.addLink(LinkType.INHERITANCE, [human, mammal]);

    const incoming = atomspace.getIncoming(human);
    expect(incoming).toHaveLength(1);
    expect(incoming[0]).toBe(link);
  });

  it('should prevent removal of nodes with incoming links', () => {
    const human = atomspace.addNode(NodeType.CONCEPT, 'Human');
    const mammal = atomspace.addNode(NodeType.CONCEPT, 'Mammal');
    atomspace.addLink(LinkType.INHERITANCE, [human, mammal]);

    const removed = atomspace.removeAtom(human.getId());
    expect(removed).toBe(false);
    expect(atomspace.getAtom(human.getId())).toBeDefined();
  });

  it('should maintain type index', () => {
    atomspace.addNode(NodeType.CONCEPT, 'Human');
    atomspace.addNode(NodeType.CONCEPT, 'Mammal');
    atomspace.addNode(NodeType.PREDICATE, 'IsAlive');

    const concepts = atomspace.getAtomsByType(NodeType.CONCEPT);
    expect(concepts).toHaveLength(2);
  });
});