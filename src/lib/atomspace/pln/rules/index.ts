import { DeductionRule } from './deduction';
import { ModusPonensRule } from './modus-ponens';
import { InversionRule } from './inversion';
import { SymmetryRule } from './symmetry';
import { TransitivityRule } from './transitivity';
import { ContrapositionRule } from './contraposition';
import { SubsetRule } from './subset';
import { EquivalenceRule } from './equivalence';
import { AnalogyRule } from './analogy';
import { IntensionalInheritanceRule } from './intensional-inheritance';
import { ExtensionalInheritanceRule } from './extensional-inheritance';
import { AbductionRule } from './abduction';
import { InductionRule } from './induction';

export const PLNRules = {
  DeductionRule,
  ModusPonensRule,
  InversionRule,
  SymmetryRule,
  TransitivityRule,
  ContrapositionRule,
  SubsetRule,
  EquivalenceRule,
  AnalogyRule,
  IntensionalInheritanceRule,
  ExtensionalInheritanceRule,
  AbductionRule,
  InductionRule
};

export * from './deduction';
export * from './modus-ponens';
export * from './inversion';
export * from './symmetry';
export * from './transitivity';
export * from './contraposition';
export * from './subset';
export * from './equivalence';
export * from './analogy';
export * from './intensional-inheritance';
export * from './extensional-inheritance';
export * from './abduction';
export * from './induction';