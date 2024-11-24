import { RecursiveOptions } from '../../../types';

export class RecursiveValidator {
  static validate(options: RecursiveOptions | undefined): boolean {
    if (!options) return true;

    if (options.maxDepth !== undefined) {
      if (typeof options.maxDepth !== 'number' || options.maxDepth < 0) {
        return false;
      }
    }

    if (options.followLinks !== undefined && 
        typeof options.followLinks !== 'boolean') {
      return false;
    }

    if (options.detectCycles !== undefined && 
        typeof options.detectCycles !== 'boolean') {
      return false;
    }

    return true;
  }

  static validateDepth(
    currentDepth: number,
    maxDepth: number | undefined
  ): boolean {
    if (maxDepth === undefined) return true;
    return currentDepth <= maxDepth;
  }

  static validateCycle(
    atomId: string,
    visitedAtoms: Set<string>,
    detectCycles: boolean | undefined
  ): boolean {
    if (!detectCycles) return true;
    return !visitedAtoms.has(atomId);
  }
}