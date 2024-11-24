import { describe, it, expect, beforeEach } from 'vitest';
import { PatternMiner } from '../../opencog/learning/PatternMiner';
import { Node } from '../../types/Node';
import { Link } from '../../types/Link';
import { NodeType, LinkType } from '../../types/AtomTypes';

describe('PatternMiner', () => {
  let miner: PatternMiner;
  let testAtoms: Array<Node | Link>;

  beforeEach(() => {
    miner = new PatternMiner(2, 3);

    const human = new Node(NodeType.CONCEPT, 'Human');
    const mortal = new Node(NodeType.CONCEPT, 'Mortal');
    const socrates = new Node(NodeType.CONCEPT, 'Socrates');
    const plato = new Node(NodeType.CONCEPT, 'Plato');

    testAtoms = [
      human,
      mortal,
      socrates,
      plato,
      new Link(LinkType.INHERITANCE, [human, mortal]),
      new Link(LinkType.INHERITANCE, [socrates, human]),
      new Link(LinkType.INHERITANCE, [plato, human])
    ];
  });

  it('should mine patterns', async () => {
    const patterns = await miner.minePatterns(testAtoms);
    expect(patterns.length).toBeGreaterThan(0);
  });

  it('should respect minimum support threshold', async () => {
    const patterns = await miner.minePatterns(testAtoms);
    patterns.forEach(pattern => {
      expect(pattern.frequency).toBeGreaterThanOrEqual(2);
    });
  });

  it('should respect maximum pattern size', async () => {
    const patterns = await miner.minePatterns(testAtoms);
    patterns.forEach(pattern => {
      expect(pattern.atoms.length).toBeLessThanOrEqual(3);
    });
  });

  it('should calculate pattern significance', async () => {
    const patterns = await miner.minePatterns(testAtoms);
    patterns.forEach(pattern => {
      expect(pattern.significance).toBeDefined();
    });
  });

  it('should get top patterns', async () => {
    await miner.minePatterns(testAtoms);
    const topPatterns = miner.getTopPatterns(2);
    expect(topPatterns).toHaveLength(2);
    expect(topPatterns[0].significance).toBeGreaterThanOrEqual(topPatterns[1].significance);
  });

  it('should provide pattern statistics', async () => {
    await miner.minePatterns(testAtoms);
    const stats = miner.getPatternStats();
    expect(stats.totalPatterns).toBeGreaterThan(0);
    expect(stats.averageFrequency).toBeGreaterThan(0);
    expect(stats.maxSignificance).toBeDefined();
  });
});