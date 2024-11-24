import { BSeriesTree } from '../reservoir/b-series-tree.js';
import { PSystem } from '../reservoir/p-system.js';
import { PatternLanguage } from '../patterns/pattern-language.js';
import { Plan9Mapper } from '../namespaces/plan9-mapper.js';

// Integration layer combining all components
export class EchoSpace {
  constructor() {
    this.patterns = new PatternLanguage();
    this.namespaces = new Plan9Mapper();
    this.reservoir = {
      structure: new BSeriesTree(),
      dynamics: new PSystem()
    };
  }

  // Map a community pattern to namespace and reservoir
  mapPattern(pattern) {
    // Create pattern in language
    this.patterns.addPattern(pattern.id, {
      name: pattern.name,
      context: pattern.context,
      problem: pattern.problem,
      solution: pattern.solution
    });

    // Create corresponding namespace
    const nsPath = `/patterns/${pattern.id}`;
    const namespace = this.namespaces.createNamespace(nsPath);

    // Create reservoir node
    const node = this.reservoir.structure.createNode(
      pattern.id,
      pattern.solution
    );

    // Create membrane for pattern dynamics
    const membrane = this.reservoir.dynamics.createMembrane(
      pattern.id,
      [pattern.context]
    );

    return {
      namespace,
      node,
      membrane
    };
  }

  // Connect patterns in all layers
  connectPatterns(pattern1Id, pattern2Id, relationship) {
    // Connect in pattern language
    this.patterns.connectPatterns(pattern1Id, pattern2Id, relationship);

    // Connect in reservoir tree
    this.reservoir.structure.addChild(pattern1Id, pattern2Id);

    // Add evolution rules between membranes
    this.reservoir.dynamics.addRule(`${pattern1Id}_${pattern2Id}`, {
      from: new RegExp(pattern1Id),
      to: pattern2Id,
      condition: membrane => membrane.objects.has(pattern1Id)
    });
  }

  // Get integrated view of the system
  getSystemState() {
    return {
      patterns: this.patterns.getPatternNetwork(),
      namespaces: this.namespaces.toAtomSpace(),
      reservoir: {
        structure: this.reservoir.structure.toReservoir(),
        state: this.reservoir.dynamics.getState()
      }
    };
  }
}