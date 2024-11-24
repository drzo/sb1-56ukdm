import { HebbianCompositionRule } from './hebbian-composition';
import { AttentionBasedInferenceRule } from './attention-based-inference';
import { ImportanceModulationRule } from './importance-modulation';

export const AttentionRules = {
  HebbianCompositionRule,
  AttentionBasedInferenceRule,
  ImportanceModulationRule
};

export * from './hebbian-composition';
export * from './attention-based-inference';
export * from './importance-modulation';