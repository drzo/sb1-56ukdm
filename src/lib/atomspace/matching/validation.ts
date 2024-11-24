import { Pattern } from '../../types';

export function validatePattern(pattern: Pattern): boolean {
  // Check for required fields based on pattern type
  if (pattern.isVariable && !pattern.variableName) {
    return false;
  }

  // Validate operator patterns
  if (pattern.operator) {
    if (!pattern.patterns || pattern.patterns.length === 0) {
      return false;
    }

    // NOT operator should have exactly one pattern
    if (pattern.operator === 'NOT' && pattern.patterns.length !== 1) {
      return false;
    }

    // Validate all sub-patterns
    return pattern.patterns.every(validatePattern);
  }

  // Validate outgoing links
  if (pattern.outgoing) {
    return pattern.outgoing.every(link => 
      typeof link === 'string' || validatePattern(link)
    );
  }

  return true;
}