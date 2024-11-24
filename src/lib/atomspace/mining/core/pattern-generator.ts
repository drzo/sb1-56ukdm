import { Atom, Pattern, AtomType } from '../../../types';

export class PatternGenerator {
  generateSingleAtomPatterns(atoms: Atom[]): Pattern[] {
    const patterns: Pattern[] = [];
    const typeFrequency = new Map<AtomType, number>();

    // Count type frequencies
    atoms.forEach(atom => {
      const count = typeFrequency.get(atom.type) || 0;
      typeFrequency.set(atom.type, count + 1);
    });

    // Generate patterns for each type
    typeFrequency.forEach((count, type) => {
      patterns.push({ type });
      patterns.push({ 
        type,
        isVariable: true,
        variableName: `?${type.replace('Node', '').replace('Link', '')}`
      });
    });

    return patterns;
  }

  generateCompoundPatterns(basePatterns: Pattern[]): Pattern[] {
    const compounds: Pattern[] = [];

    // Generate AND patterns
    for (let i = 0; i < basePatterns.length; i++) {
      for (let j = i + 1; j < basePatterns.length; j++) {
        compounds.push({
          operator: 'AND',
          patterns: [basePatterns[i], basePatterns[j]]
        });
      }
    }

    // Generate evaluation link patterns
    basePatterns.forEach(p1 => {
      basePatterns.forEach(p2 => {
        if (p1.type !== p2.type) {
          compounds.push({
            type: 'EvaluationLink',
            outgoing: [p1, p2]
          });
        }
      });
    });

    return compounds;
  }

  generateRecursivePatterns(pattern: Pattern, maxDepth: number = 2): Pattern[] {
    const patterns: Pattern[] = [];
    
    patterns.push({
      ...pattern,
      recursive: {
        maxDepth,
        followLinks: true,
        detectCycles: true
      }
    });

    return patterns;
  }
}</content>