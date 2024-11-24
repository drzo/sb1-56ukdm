import { describe, it, expect, beforeEach } from 'vitest';
import { AtomSpaceCore } from '../../atomspace/core/AtomSpaceCore';
import { PatternMatcher } from '../../atomspace/pattern/PatternMatcher';
import { NodeType, LinkType } from '../../types/AtomTypes';

describe('PatternMatcher', () => {
  let atomspace: AtomSpaceCore;
  let matcher: PatternMatcher;

  beforeEach(() => {
    atomspace = new AtomSpaceCore();
    matcher = new PatternMatcher(atomspace);
  });

  it('should match simple node patterns', () => {
    const human = atomspace.addNode(NodeType.CONCEPT, 'Human');
    const animal = atomspace.addNode(NodeType.CONCEPT, 'Animal');

    const matches = matcher.findMatches({
      type: NodeType.CONCEPT,
      name: 'Human'
    });

    expect(matches).toHaveLength(1);
    expect(matches[0]).toBe(human);
  });

  it('should match link patterns', () => {
    const human = atomspace.addNode(NodeType.CONCEPT, 'Human');
    const mammal = atomspace.addNode(NodeType.CONCEPT, 'Mammal');
    const link = atomspace.addLink(LinkType.INHERITANCE, [human, mammal]);

    const matches = matcher.findMatches({
      type: LinkType.INHERITANCE,
      outgoing: [
        { type: NodeType.CONCEPT, name: 'Human' },
        { type: NodeType.CONCEPT, name: 'Mammal' }
      ]
    });

    expect(matches).toHaveLength(1);
    expect(matches[0]).toBe(link);
  });

  it('should match truth value ranges', () => {
    atomspace.addNode(NodeType.CONCEPT, 'High', { strength: 0.9, confidence: 0.9 });
    atomspace.addNode(NodeType.CONCEPT, 'Low', { strength: 0.3, confidence: 0.3 });

    const matches = matcher.findMatches({
      type: NodeType.CONCEPT,
      truthValue: {
        strength: [0.8, 1.0],
        confidence: [0.8, 1.0]
      }
    });

    expect(matches).toHaveLength(1);
    expect(matches[0].getTruthValue().strength).toBeGreaterThanOrEqual(0.8);
  });
});