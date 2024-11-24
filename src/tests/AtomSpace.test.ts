import { describe, it, expect } from 'vitest';
import { AtomSpace } from '../AtomSpace';
import { NodeType, LinkType } from '../types/AtomTypes';

describe('AtomSpace', () => {
  it('should create and store nodes', () => {
    const atomspace = new AtomSpace();
    const node = atomspace.addNode(NodeType.CONCEPT, 'Person');
    
    expect(node.getType()).toBe(NodeType.CONCEPT);
    expect(node.getName()).toBe('Person');
    expect(atomspace.getAtomCount()).toBe(1);
  });

  it('should create and store links', () => {
    const atomspace = new AtomSpace();
    const person = atomspace.addNode(NodeType.CONCEPT, 'Person');
    const john = atomspace.addNode(NodeType.CONCEPT, 'John');
    const link = atomspace.addLink(LinkType.INHERITANCE, [john, person]);
    
    expect(link.getType()).toBe(LinkType.INHERITANCE);
    expect(link.getOutgoingSet()).toHaveLength(2);
    expect(atomspace.getAtomCount()).toBe(3);
  });
});