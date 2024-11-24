import { Atom, Pattern } from '../../types';

export class TemporalPatternGenerator {
  generatePatterns(atoms: Atom[]): Pattern[] {
    const patterns: Pattern[] = [];

    // Generate sequence patterns
    patterns.push(...this.generateSequencePatterns(atoms));

    // Generate interval patterns
    patterns.push(...this.generateIntervalPatterns(atoms));

    // Generate periodic patterns
    patterns.push(...this.generatePeriodicPatterns(atoms));

    return patterns;
  }

  private generateSequencePatterns(atoms: Atom[]): Pattern[] {
    const patterns: Pattern[] = [];
    const temporalAtoms = atoms.filter(atom => this.hasTemporalInfo(atom));

    for (let i = 0; i < temporalAtoms.length; i++) {
      for (let j = i + 1; j < temporalAtoms.length; j++) {
        patterns.push({
          type: 'TemporalSequenceLink',
          outgoing: [
            { type: temporalAtoms[i].type, name: temporalAtoms[i].name },
            { type: temporalAtoms[j].type, name: temporalAtoms[j].name }
          ]
        });
      }
    }

    return patterns;
  }

  private generateIntervalPatterns(atoms: Atom[]): Pattern[] {
    const patterns: Pattern[] = [];
    const intervalAtoms = atoms.filter(atom => this.hasIntervalInfo(atom));

    for (const atom of intervalAtoms) {
      patterns.push({
        type: 'TemporalIntervalLink',
        outgoing: [
          { type: atom.type, name: atom.name },
          { type: 'TimeNode', isVariable: true, variableName: 'duration' }
        ]
      });
    }

    return patterns;
  }

  private generatePeriodicPatterns(atoms: Atom[]): Pattern[] {
    const patterns: Pattern[] = [];
    const periodicAtoms = atoms.filter(atom => this.hasPeriodicInfo(atom));

    for (const atom of periodicAtoms) {
      patterns.push({
        type: 'TemporalPeriodicLink',
        outgoing: [
          { type: atom.type, name: atom.name },
          { type: 'TimeNode', isVariable: true, variableName: 'period' }
        ],
        recursive: {
          maxDepth: 3,
          followLinks: true,
          detectCycles: true
        }
      });
    }

    return patterns;
  }

  private hasTemporalInfo(atom: Atom): boolean {
    return atom.type.includes('Temporal') || 
           (atom.outgoing?.some(id => id.includes('time')) ?? false);
  }

  private hasIntervalInfo(atom: Atom): boolean {
    return atom.type.includes('Interval') ||
           atom.name.includes('duration');
  }

  private hasPeriodicInfo(atom: Atom): boolean {
    return atom.type.includes('Periodic') ||
           atom.name.includes('cycle') ||
           atom.name.includes('period');
  }
}