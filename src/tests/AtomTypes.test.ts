import { describe, it, expect } from 'vitest';
import { NodeType, LinkType, isValidNodeType, isValidLinkType } from '../types/AtomTypes';
import { AtomSpace } from '../AtomSpace';

describe('Atom Types', () => {
  it('should validate node types', () => {
    expect(isValidNodeType(NodeType.CONCEPT)).toBe(true);
    expect(isValidNodeType('InvalidType')).toBe(false);
  });

  it('should validate link types', () => {
    expect(isValidLinkType(LinkType.INHERITANCE)).toBe(true);
    expect(isValidLinkType('InvalidType')).toBe(false);
  });

  it('should create different types of nodes', () => {
    const atomspace = new AtomSpace();
    
    const concept = atomspace.addNode(NodeType.CONCEPT, 'Human');
    const predicate = atomspace.addNode(NodeType.PREDICATE, 'isAlive');
    const number = atomspace.addNode(NodeType.NUMBER, '42');
    
    expect(concept.getType()).toBe(NodeType.CONCEPT);
    expect(predicate.getType()).toBe(NodeType.PREDICATE);
    expect(number.getType()).toBe(NodeType.NUMBER);
  });
});