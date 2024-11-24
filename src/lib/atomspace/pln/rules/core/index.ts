import { DeductionRule } from './deduction-rule';
import { ModusPonensRule } from './modus-ponens-rule';
import { InversionRule } from './inversion-rule';
import { SymmetryRule } from './symmetry-rule';
import { TransitivityRule } from './transitivity-rule';
import { ContrapositionRule } from './contraposition-rule';
import { SubsetRule } from './subset-rule';
import { EquivalenceRule } from './equivalence-rule';
import { AnalogyRule } from './analogy-rule';

export const CoreRules = {
  DeductionRule,
  ModusPonensRule,
  InversionRule,
  SymmetryRule,
  TransitivityRule,
  ContrapositionRule,
  SubsetRule,
  EquivalenceRule,
  AnalogyRule
};

export * from './deduction-rule';
export * from './modus-ponens-rule';
export * from './inversion-rule';
export * from './symmetry-rule';
export * from './transitivity-rule';
export * from './contraposition-rule';
export * from './subset-rule';
export * from './equivalence-rule';
export * from './analogy-rule';