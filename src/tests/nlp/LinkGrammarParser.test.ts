import { describe, it, expect, beforeEach } from 'vitest';
import { LinkGrammarParser } from '../../nlp/LinkGrammarParser';

describe('LinkGrammarParser', () => {
  let parser: LinkGrammarParser;

  beforeEach(() => {
    parser = new LinkGrammarParser();
  });

  it('should parse simple sentences', async () => {
    const result = await parser.parse('The cat chases the mouse');
    expect(result.tokens).toHaveLength(5);
    expect(result.links.length).toBeGreaterThan(0);
  });

  it('should identify subject-verb links', async () => {
    const result = await parser.parse('John runs');
    const subjectVerbLinks = result.links.filter(link => link.type === 'S');
    expect(subjectVerbLinks).toHaveLength(1);
  });

  it('should identify verb-object links', async () => {
    const result = await parser.parse('She reads books');
    const verbObjectLinks = result.links.filter(link => link.type === 'O');
    expect(verbObjectLinks).toHaveLength(1);
  });

  it('should build maximal planar graph', async () => {
    const result = await parser.parse('The big dog chases the small cat');
    const planarGraph = parser.buildMaximalPlanarGraph(result.tokens, result.links);
    expect(planarGraph.length).toBeGreaterThan(0);
    
    // Check planarity
    for (let i = 0; i < planarGraph.length; i++) {
      for (let j = i + 1; j < planarGraph.length; j++) {
        const edge1 = planarGraph[i];
        const edge2 = planarGraph[j];
        expect(
          edge1[0] < edge2[0] && edge1[1] > edge2[1] ||
          edge1[0] > edge2[0] && edge1[1] < edge2[1]
        ).toBe(false);
      }
    }
  });
});