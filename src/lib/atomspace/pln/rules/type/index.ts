import { TypeInheritanceRule } from './type-inheritance-rule';
import { TypeCompositionRule } from './type-composition-rule';
import { TypeIntersectionRule } from './type-intersection-rule';
import { TypeUnionRule } from './type-union-rule';
import { TypeSubsumptionRule } from './type-subsumption-rule';
import { TypeVarianceRule } from './type-variance-rule';
import { TypeConstraintRule } from './type-constraint-rule';

export const TypeRules = {
  TypeInheritanceRule,
  TypeCompositionRule,
  TypeIntersectionRule,
  TypeUnionRule,
  TypeSubsumptionRule,
  TypeVarianceRule,
  TypeConstraintRule
};

export * from './type-inheritance-rule';
export * from './type-composition-rule';
export * from './type-intersection-rule';
export * from './type-union-rule';
export * from './type-subsumption-rule';
export * from './type-variance-rule';
export * from './type-constraint-rule';