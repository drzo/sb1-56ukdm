import { Atom } from '../../types';
import { PLNRule } from '../rules/pln-rule';

export interface InferenceStep {
  rule: PLNRule;
  inputs: Atom[];
  outputs: Atom[];
  timestamp: number;
}

export class InferenceTrail {
  private steps: InferenceStep[] = [];

  addStep(rule: PLNRule, inputs: Atom[], outputs: Atom[]): void {
    this.steps.push({
      rule,
      inputs,
      outputs,
      timestamp: Date.now()
    });
  }

  getSteps(): InferenceStep[] {
    return [...this.steps];
  }

  explainInference(atom: Atom): InferenceStep[] {
    return this.steps.filter(step =>
      step.outputs.some(output => output.id === atom.id)
    );
  }

  clear(): void {
    this.steps = [];
  }
}