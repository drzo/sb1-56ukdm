import { Atom } from '../../types';
import { PLNRule } from '../rules/pln-rule';

export interface InferenceStep {
  inference: Atom;
  sourceAtoms: Atom[];
  rule: PLNRule;
  timestamp: number;
}

export class InferenceTracker {
  private inferenceHistory: InferenceStep[] = [];

  recordInference(
    inference: Atom,
    sourceAtoms: Atom[],
    rule?: PLNRule
  ): void {
    this.inferenceHistory.push({
      inference,
      sourceAtoms,
      rule: rule!,
      timestamp: Date.now()
    });
  }

  getInferenceHistory(): InferenceStep[] {
    return [...this.inferenceHistory];
  }

  getInferenceChain(atom: Atom): InferenceStep[] {
    return this.inferenceHistory.filter(step =>
      step.inference.id === atom.id ||
      step.sourceAtoms.some(source => source.id === atom.id)
    );
  }

  clear(): void {
    this.inferenceHistory = [];
  }
}