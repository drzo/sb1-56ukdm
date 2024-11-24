import { describe, it, expect, beforeEach } from 'vitest';
import { HyperonDAS } from '../hyperon/HyperonDAS';
import { NodeType } from '../types/AtomTypes';

describe('HyperonDAS', () => {
  let das: HyperonDAS;

  beforeEach(() => {
    das = new HyperonDAS();
  });

  it('should add and query nodes', async () => {
    const node = await das.addNode(NodeType.CONCEPT, 'Human', {
      strength: 0.9,
      confidence: 0.8
    });

    const results = await das.query({
      type: NodeType.CONCEPT,
      name: 'Human',
      truthValue: {
        strength: [0.8, 1.0],
        confidence: [0.7, 0.9]
      }
    });

    expect(results).toHaveLength(1);
    expect(results[0].getId()).toBe(node.getId());
  });

  it('should find similar atoms', async () => {
    const human1 = await das.addNode(NodeType.CONCEPT, 'Human', {
      strength: 0.9,
      confidence: 0.9
    });

    await das.addNode(NodeType.CONCEPT, 'Person', {
      strength: 0.85,
      confidence: 0.85
    });

    const similar = await das.findSimilar(human1, 0.8);
    expect(similar).toHaveLength(2);
  });
});