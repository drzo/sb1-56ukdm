import { MatchContext } from '../../../types';

export class MatchContextValidator {
  static validateDepth(depth: number | undefined): boolean {
    return typeof depth === 'number' && depth >= 0;
  }

  static validateVisited(visited: Set<string> | undefined): boolean {
    return visited instanceof Set;
  }

  static validateAtomSpace(atomSpace: Map<string, any> | undefined): boolean {
    return atomSpace instanceof Map;
  }

  static validate(context: MatchContext): boolean {
    if (!context) return false;

    if (!this.validateDepth(context.depth)) {
      return false;
    }

    if (!this.validateVisited(context.visited)) {
      return false;
    }

    if (!this.validateAtomSpace(context.atomSpace)) {
      return false;
    }

    return true;
  }
}