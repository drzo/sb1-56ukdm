import { Atom, Pattern, TruthValue } from '../../types';
import { validatePattern } from '../matching/validation/pattern';

export interface MiningConfig {
  minSupport: number;
  maxPatternSize: number;
  minConfidence: number;
  interestingness: InterestingnessMeasure;
  maxPatterns: number;
}

export type InterestingnessMeasure = 
  | 'frequency'
  | 'surprisingness'
  | 'interaction-information'
  | 'mutual-information';

export interface MinedPattern {
  pattern: Pattern;
  support: number;
  confidence: number;
  interestingness: number;
  instances: Atom[][];
}

export class PatternMiner {
  private atomSpace: Map<string, Atom>;
  private config: MiningConfig;

  constructor(
    atomSpace: Map<string, Atom>,
    config: Partial<MiningConfig> = {}
  ) {
    this.atomSpace = atomSpace;
    this.config = {
      minSupport: config.minSupport ?? 0.1,
      maxPatternSize: config.maxPatternSize ?? 3,
      minConfidence: config.minConfidence ?? 0.5,
      interestingness: config.interestingness ?? 'frequency',
      maxPatterns: config.maxPatterns ?? 100
    };
  }

  mine(): MinedPattern[] {
    const patterns: MinedPattern[] = [];
    const frequentPatterns = this.findFrequentPatterns();
    
    for (const pattern of frequentPatterns) {
      const support = this.calculateSupport(pattern);
      const confidence = this.calculateConfidence(pattern);
      const interestingness = this.calculateInterestingness(pattern);

      if (support >= this.config.minSupport && 
          confidence >= this.config.minConfidence) {
        patterns.push({
          pattern,
          support,
          confidence,
          interestingness,
          instances: this.findInstances(pattern)
        });
      }
    }

    return this.rankPatterns(patterns)
      .slice(0, this.config.maxPatterns);
  }

  private findFrequentPatterns(): Pattern[] {
    const patterns: Pattern[] = [];
    const atoms = Array.from(this.atomSpace.values());

    // Start with single-atom patterns
    const singlePatterns = this.generateSingleAtomPatterns(atoms);
    patterns.push(...singlePatterns);

    // Grow patterns incrementally
    for (let size = 2; size <= this.config.maxPatternSize; size++) {
      const candidates = this.generateCandidatePatterns(patterns, size);
      const frequent = candidates.filter(pattern => 
        this.calculateSupport(pattern) >= this.config.minSupport
      );
      patterns.push(...frequent);
    }

    return patterns;
  }

  private generateSingleAtomPatterns(atoms: Atom[]): Pattern[] {
    const patterns: Pattern[] = [];
    const typeFrequency = new Map<string, number>();

    // Count type frequencies
    atoms.forEach(atom => {
      const count = typeFrequency.get(atom.type) || 0;
      typeFrequency.set(atom.type, count + 1);
    });

    // Generate patterns for frequent types
    typeFrequency.forEach((count, type) => {
      const support = count / atoms.length;
      if (support >= this.config.minSupport) {
        patterns.push({ type: type as any });
      }
    });

    return patterns;
  }

  private generateCandidatePatterns(patterns: Pattern[], size: number): Pattern[] {
    const candidates: Pattern[] = [];
    const basePatterns = patterns.filter(p => this.getPatternSize(p) === size - 1);

    for (let i = 0; i < basePatterns.length; i++) {
      for (let j = i + 1; j < basePatterns.length; j++) {
        const merged = this.mergePatterns(basePatterns[i], basePatterns[j]);
        if (merged && validatePattern(merged)) {
          candidates.push(merged);
        }
      }
    }

    return candidates;
  }

  private mergePatterns(p1: Pattern, p2: Pattern): Pattern | null {
    // Simple pattern merging strategy
    if (p1.type === p2.type) {
      return {
        type: p1.type,
        operator: 'AND',
        patterns: [p1, p2]
      };
    }

    if (!p1.outgoing && !p2.outgoing) {
      return {
        type: 'EvaluationLink',
        outgoing: [
          { type: p1.type, isVariable: true, variableName: 'X' },
          { type: p2.type, isVariable: true, variableName: 'Y' }
        ]
      };
    }

    return null;
  }

  private calculateSupport(pattern: Pattern): number {
    const instances = this.findInstances(pattern);
    return instances.length / this.atomSpace.size;
  }

  private calculateConfidence(pattern: Pattern): number {
    const instances = this.findInstances(pattern);
    if (instances.length === 0) return 0;

    const validInstances = instances.filter(atoms => 
      atoms.every(atom => atom.truthValue && atom.truthValue.confidence > 0.5)
    );

    return validInstances.length / instances.length;
  }

  private calculateInterestingness(pattern: Pattern): number {
    switch (this.config.interestingness) {
      case 'frequency':
        return this.calculateSupport(pattern);
      
      case 'surprisingness':
        return this.calculateSurprisingness(pattern);
      
      case 'interaction-information':
        return this.calculateInteractionInformation(pattern);
      
      case 'mutual-information':
        return this.calculateMutualInformation(pattern);
      
      default:
        return 0;
    }
  }

  private calculateSurprisingness(pattern: Pattern): number {
    const observed = this.calculateSupport(pattern);
    const expected = this.calculateExpectedSupport(pattern);
    return Math.abs(observed - expected);
  }

  private calculateExpectedSupport(pattern: Pattern): number {
    if (!pattern.patterns) return this.calculateSupport(pattern);

    const supports = pattern.patterns.map(p => this.calculateSupport(p));
    return supports.reduce((a, b) => a * b, 1);
  }

  private calculateInteractionInformation(pattern: Pattern): number {
    if (!pattern.patterns || pattern.patterns.length < 2) return 0;

    const joint = this.calculateSupport(pattern);
    const individual = pattern.patterns.map(p => this.calculateSupport(p));
    const pairwise = this.calculatePairwiseSupports(pattern.patterns);

    let ii = joint;
    individual.forEach(p => ii -= p);
    pairwise.forEach(p => ii += p);

    return Math.abs(ii);
  }

  private calculateMutualInformation(pattern: Pattern): number {
    if (!pattern.patterns || pattern.patterns.length !== 2) return 0;

    const joint = this.calculateSupport(pattern);
    const [p1, p2] = pattern.patterns;
    const s1 = this.calculateSupport(p1);
    const s2 = this.calculateSupport(p2);

    if (s1 === 0 || s2 === 0) return 0;
    return joint * Math.log2(joint / (s1 * s2));
  }

  private calculatePairwiseSupports(patterns: Pattern[]): number[] {
    const supports: number[] = [];
    
    for (let i = 0; i < patterns.length; i++) {
      for (let j = i + 1; j < patterns.length; j++) {
        const pair = {
          operator: 'AND',
          patterns: [patterns[i], patterns[j]]
        };
        supports.push(this.calculateSupport(pair));
      }
    }

    return supports;
  }

  private findInstances(pattern: Pattern): Atom[][] {
    // Use existing pattern matching functionality
    const instances: Atom[][] = [];
    const atoms = Array.from(this.atomSpace.values());

    atoms.forEach(atom => {
      const matches = this.matchPattern(atom, pattern);
      if (matches) {
        instances.push(matches);
      }
    });

    return instances;
  }

  private matchPattern(atom: Atom, pattern: Pattern): Atom[] | null {
    // Simplified pattern matching for mining
    if (pattern.type && pattern.type !== atom.type) return null;
    
    if (pattern.operator === 'AND' && pattern.patterns) {
      const matches = pattern.patterns.map(p => this.matchPattern(atom, p));
      return matches.every(m => m !== null) 
        ? matches.flat()
        : null;
    }

    if (pattern.outgoing && atom.outgoing) {
      if (pattern.outgoing.length !== atom.outgoing.length) return null;
      
      const outgoingMatches = pattern.outgoing.map((p, i) => {
        const target = this.atomSpace.get(atom.outgoing![i]);
        return target && (typeof p === 'string' 
          ? p === target.id 
          : this.matchPattern(target, p));
      });

      return outgoingMatches.every(m => m !== null)
        ? [atom, ...outgoingMatches.flat().filter((a): a is Atom => !!a)]
        : null;
    }

    return [atom];
  }

  private getPatternSize(pattern: Pattern): number {
    if (pattern.patterns) {
      return pattern.patterns.reduce((sum, p) => sum + this.getPatternSize(p), 0);
    }
    return 1;
  }

  private rankPatterns(patterns: MinedPattern[]): MinedPattern[] {
    return patterns.sort((a, b) => {
      // Primary sort by interestingness
      if (a.interestingness !== b.interestingness) {
        return b.interestingness - a.interestingness;
      }
      // Secondary sort by support
      if (a.support !== b.support) {
        return b.support - a.support;
      }
      // Tertiary sort by confidence
      return b.confidence - a.confidence;
    });
  }
}</content></file>

<boltAction type="file" filePath="src/lib/atomspace/mining/mining-results.ts">import { MinedPattern } from './pattern-miner';

export interface MiningResultStats {
  totalPatterns: number;
  averageSupport: number;
  averageConfidence: number;
  averageInterestingness: number;
  patternSizeDistribution: Map<number, number>;
  typeDistribution: Map<string, number>;
}

export class MiningResults {
  constructor(private patterns: MinedPattern[]) {}

  getStats(): MiningResultStats {
    const stats: MiningResultStats = {
      totalPatterns: this.patterns.length,
      averageSupport: this.calculateAverage(p => p.support),
      averageConfidence: this.calculateAverage(p => p.confidence),
      averageInterestingness: this.calculateAverage(p => p.interestingness),
      patternSizeDistribution: this.getPatternSizeDistribution(),
      typeDistribution: this.getTypeDistribution()
    };

    return stats;
  }

  private calculateAverage(selector: (p: MinedPattern) => number): number {
    if (this.patterns.length === 0) return 0;
    const sum = this.patterns.reduce((acc, p) => acc + selector(p), 0);
    return sum / this.patterns.length;
  }

  private getPatternSizeDistribution(): Map<number, number> {
    const distribution = new Map<number, number>();
    
    this.patterns.forEach(pattern => {
      const size = this.getPatternSize(pattern.pattern);
      distribution.set(size, (distribution.get(size) || 0) + 1);
    });

    return distribution;
  }

  private getTypeDistribution(): Map<string, number> {
    const distribution = new Map<string, number>();
    
    this.patterns.forEach(pattern => {
      this.collectTypes(pattern.pattern).forEach(type => {
        distribution.set(type, (distribution.get(type) || 0) + 1);
      });
    });

    return distribution;
  }

  private getPatternSize(pattern: any): number {
    if (pattern.patterns) {
      return pattern.patterns.reduce((sum: number, p: any) => 
        sum + this.getPatternSize(p), 0
      );
    }
    return 1;
  }

  private collectTypes(pattern: any): string[] {
    const types: string[] = [];
    
    if (pattern.type) {
      types.push(pattern.type);
    }
    
    if (pattern.patterns) {
      pattern.patterns.forEach((p: any) => {
        types.push(...this.collectTypes(p));
      });
    }
    
    if (pattern.outgoing) {
      pattern.outgoing.forEach((p: any) => {
        if (typeof p !== 'string') {
          types.push(...this.collectTypes(p));
        }
      });
    }

    return types;
  }

  filterByMinSupport(minSupport: number): MinedPattern[] {
    return this.patterns.filter(p => p.support >= minSupport);
  }

  filterByMinConfidence(minConfidence: number): MinedPattern[] {
    return this.patterns.filter(p => p.confidence >= minConfidence);
  }

  filterByMinInterestingness(minInterestingness: number): MinedPattern[] {
    return this.patterns.filter(p => p.interestingness >= minInterestingness);
  }

  getTopPatterns(n: number): MinedPattern[] {
    return this.patterns
      .sort((a, b) => b.interestingness - a.interestingness)
      .slice(0, n);
  }
}</content></file>

<boltAction type="file" filePath="src/lib/atomspace/mining/visualization/pattern-graph.ts">import * as d3 from 'd3';
import { MinedPattern } from '../pattern-miner';

interface PatternNode {
  id: string;
  pattern: MinedPattern;
  size: number;
}

interface PatternLink {
  source: string;
  target: string;
  similarity: number;
}

export class PatternGraph {
  private width: number;
  private height: number;
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private simulation: d3.Simulation<PatternNode, PatternLink>;

  constructor(
    container: HTMLElement,
    width: number = 800,
    height: number = 600
  ) {
    this.width = width;
    this.height = height;

    this.svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    this.simulation = d3.forceSimulation<PatternNode>()
      .force('link', d3.forceLink<PatternNode, PatternLink>().id(d => d.id))
      .force('charge', d3.forceManyBody().strength(-100))
      .force('center', d3.forceCenter(width / 2, height / 2));
  }

  visualize(patterns: MinedPattern[]): void {
    const nodes: PatternNode[] = patterns.map((pattern, i) => ({
      id: `pattern-${i}`,
      pattern,
      size: pattern.instances.length
    }));

    const links: PatternLink[] = this.calculatePatternLinks(patterns);

    const link = this.svg.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', d => d.similarity * 2);

    const node = this.svg.append('g')
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', d => Math.sqrt(d.size) * 2)
      .attr('fill', d => this.getColorByInterestingness(d.pattern.interestingness))
      .call(this.drag(this.simulation));

    node.append('title')
      .text(d => this.getPatternTooltip(d.pattern));

    this.simulation
      .nodes(nodes)
      .on('tick', () => {
        link
          .attr('x1', d => (d.source as any).x)
          .attr('y1', d => (d.source as any).y)
          .attr('x2', d => (d.target as any).x)
          .attr('y2', d => (d.target as any).y);

        node
          .attr('cx', d => d.x!)
          .attr('cy', d => d.y!);
      });

    (this.simulation.force('link') as d3.ForceLink<PatternNode, PatternLink>)
      .links(links);
  }

  private calculatePatternLinks(patterns: MinedPattern[]): PatternLink[] {
    const links: PatternLink[] = [];

    for (let i = 0; i < patterns.length; i++) {
      for (let j = i + 1; j < patterns.length; j++) {
        const similarity = this.calculatePatternSimilarity(
          patterns[i],
          patterns[j]
        );

        if (similarity > 0.5) {
          links.push({
            source: `pattern-${i}`,
            target: `pattern-${j}`,
            similarity
          });
        }
      }
    }

    return links;
  }

  private calculatePatternSimilarity(p1: MinedPattern, p2: MinedPattern): number {
    // Jaccard similarity of instance sets
    const set1 = new Set(p1.instances.flat().map(a => a.id));
    const set2 = new Set(p2.instances.flat().map(a => a.id));

    const intersection = new Set(
      [...set1].filter(x => set2.has(x))
    );

    const union = new Set([...set1, ...set2]);

    return intersection.size / union.size;
  }

  private getColorByInterestingness(value: number): string {
    const colorScale = d3.scaleSequential()
      .domain([0, 1])
      .interpolator(d3.interpolateViridis);

    return colorScale(value);
  }

  private getPatternTooltip(pattern: MinedPattern): string {
    return `Pattern Type: ${pattern.pattern.type || 'Complex'}\n` +
           `Support: ${(pattern.support * 100).toFixed(1)}%\n` +
           `Confidence: ${(pattern.confidence * 100).toFixed(1)}%\n` +
           `Interestingness: ${pattern.interestingness.toFixed(3)}\n` +
           `Instances: ${pattern.instances.length}`;
  }

  private drag(simulation: d3.Simulation<PatternNode, PatternLink>) {
    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return d3.drag<SVGCircleElement, PatternNode>()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);
  }
}</content></file>

<boltAction type="start">
<command>npm run dev</command>