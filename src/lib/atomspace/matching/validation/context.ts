import { MatchContext } from '../../../types';

export function validateMatchContext(context: MatchContext): boolean {
  if (!context) return false;
  
  // Depth validation
  if (typeof context.depth !== 'number' || context.depth < 0) return false;

  // Visited set validation
  if (!(context.visited instanceof Set)) return false;

  // AtomSpace validation
  if (!(context.atomSpace instanceof Map)) return false;

  return true;
}