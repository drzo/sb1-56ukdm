import { RecursiveOptions } from '../../../types';

export function validateRecursiveOptions(options: RecursiveOptions): boolean {
  if (!options) return false;

  // Validate maxDepth
  if (options.maxDepth !== undefined) {
    if (typeof options.maxDepth !== 'number' || options.maxDepth < 0) {
      return false;
    }
  }

  // Validate followLinks
  if (options.followLinks !== undefined) {
    if (typeof options.followLinks !== 'boolean') {
      return false;
    }
  }

  // Validate detectCycles
  if (options.detectCycles !== undefined) {
    if (typeof options.detectCycles !== 'boolean') {
      return false;
    }
  }

  return true;
}