import { FuzzyConjunctionRule } from './fuzzy-conjunction';
import { FuzzyDisjunctionRule } from './fuzzy-disjunction';
import { FuzzyNegationRule } from './fuzzy-negation';
import { FuzzyImplicationRule } from './fuzzy-implication';
import { FuzzyCompositionRule } from './fuzzy-composition';

export const FuzzyRules = {
  FuzzyConjunctionRule,
  FuzzyDisjunctionRule,
  FuzzyNegationRule,
  FuzzyImplicationRule,
  FuzzyCompositionRule
};

export * from './fuzzy-conjunction';
export * from './fuzzy-disjunction';
export * from './fuzzy-negation';
export * from './fuzzy-implication';
export * from './fuzzy-composition';