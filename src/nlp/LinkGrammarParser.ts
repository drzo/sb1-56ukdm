import { Logger } from '../cogutil/Logger';

export class LinkGrammarParser {
  constructor() {
    Logger.info('LinkGrammarParser initialized');
  }

  async parse(sentence: string): Promise<{
    tokens: string[];
    tags: string[];
    links: Array<{
      left: number;
      right: number;
      type: string;
    }>;
  }> {
    try {
      // Simple tokenization
      const tokens = sentence.toLowerCase().split(/\s+/);
      
      // Basic POS tagging
      const tags = this.simplePOSTag(tokens);
      
      // Find basic links
      const links = this.findBasicLinks(tokens, tags);

      return { tokens, tags, links };
    } catch (error) {
      Logger.error('Failed to parse sentence:', error);
      throw error;
    }
  }

  private simplePOSTag(tokens: string[]): string[] {
    return tokens.map(token => {
      if (this.isNoun(token)) return 'N';
      if (this.isVerb(token)) return 'V';
      if (this.isAdjective(token)) return 'ADJ';
      if (this.isDeterminer(token)) return 'DET';
      return 'OTHER';
    });
  }

  private findBasicLinks(tokens: string[], tags: string[]): Array<{
    left: number;
    right: number;
    type: string;
  }> {
    const links = [];

    for (let i = 0; i < tokens.length - 1; i++) {
      if (tags[i] === 'N' && tags[i + 1] === 'V') {
        links.push({ left: i, right: i + 1, type: 'SUBJ' });
      }
      if (tags[i] === 'V' && tags[i + 1] === 'N') {
        links.push({ left: i, right: i + 1, type: 'OBJ' });
      }
      if (tags[i] === 'DET' && tags[i + 1] === 'N') {
        links.push({ left: i, right: i + 1, type: 'DET' });
      }
      if (tags[i] === 'ADJ' && tags[i + 1] === 'N') {
        links.push({ left: i, right: i + 1, type: 'MOD' });
      }
    }

    return links;
  }

  private isNoun(word: string): boolean {
    const nouns = new Set(['cell', 'protein', 'mitochondria', 'energy', 'molecule']);
    return nouns.has(word);
  }

  private isVerb(word: string): boolean {
    const verbs = new Set(['is', 'produces', 'consumes', 'generates', 'metabolizes']);
    return verbs.has(word);
  }

  private isAdjective(word: string): boolean {
    const adjectives = new Set(['active', 'efficient', 'metabolic', 'cellular', 'energetic']);
    return adjectives.has(word);
  }

  private isDeterminer(word: string): boolean {
    const determiners = new Set(['the', 'a', 'an', 'this', 'that']);
    return determiners.has(word);
  }

  buildMaximalPlanarGraph(tokens: string[], links: Array<{
    left: number;
    right: number;
    type: string;
  }>): Array<Array<number>> {
    const n = tokens.length;
    const graph: Array<Array<number>> = Array(n).fill(null).map(() => []);

    // Add all links to the graph
    for (const link of links) {
      graph[link.left].push(link.right);
      graph[link.right].push(link.left);
    }

    // Ensure planarity
    const visited = new Set<string>();
    const planarLinks: Array<Array<number>> = [];

    for (let i = 0; i < n; i++) {
      for (const j of graph[i]) {
        const edge = `${Math.min(i, j)}-${Math.max(i, j)}`;
        if (!visited.has(edge) && this.isValidPlanarEdge(planarLinks, i, j)) {
          planarLinks.push([i, j]);
          visited.add(edge);
        }
      }
    }

    return planarLinks;
  }

  private isValidPlanarEdge(
    planarLinks: Array<Array<number>>,
    i: number,
    j: number
  ): boolean {
    for (const [a, b] of planarLinks) {
      if (this.intersects(i, j, a, b)) {
        return false;
      }
    }
    return true;
  }

  private intersects(i: number, j: number, a: number, b: number): boolean {
    const ccw = (p1: number, p2: number, p3: number) => {
      return (p2 - p1) * (p3 - p1) > 0;
    };

    return ccw(i, a, b) !== ccw(j, a, b) && ccw(i, j, a) !== ccw(i, j, b);
  }
}