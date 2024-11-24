import { Atom } from '../../types';
import { PLNConfig } from '../config/pln-config';
import { PLNEngine } from './pln-engine';
import { RuleManager } from './rule-manager';
import { InferenceManager } from './inference-manager';
import { AttentionManager } from '../../attention/ecan/core/attention-manager';

export class PLNController {
  private engine: PLNEngine;
  private ruleManager: RuleManager;
  private inferenceManager: InferenceManager;

  constructor(
    private atomSpace: Map<string, Atom>,
    private attentionManager: AttentionManager,
    private config: PLNConfig
  ) {
    this.ruleManager = new RuleManager();
    this.inferenceManager = new InferenceManager(config);
    this.engine = new PLNEngine(
      atomSpace,
      attentionManager,
      config
    );
  }

  step(): Atom[] {
    // Get active rules based on current context
    const activeRules = this.ruleManager.getActiveRules(
      this.atomSpace,
      this.config
    );

    // Execute inference step
    const newInferences = this.engine.inferenceStep(activeRules);

    // Process and validate new inferences
    const validInferences = this.inferenceManager.processInferences(
      newInferences,
      this.atomSpace
    );

    // Update atom space with new inferences
    validInferences.forEach(inference => {
      this.atomSpace.set(inference.id, inference);
    });

    return validInferences;
  }

  run(maxSteps: number = this.config.maxSteps): Atom[] {
    let allInferences: Atom[] = [];
    let step = 0;
    let newInferences: Atom[] = [];

    do {
      newInferences = this.step();
      allInferences = [...allInferences, ...newInferences];
      step++;
    } while (newInferences.length > 0 && step < maxSteps);

    return allInferences;
  }

  explainInference(atom: Atom): string {
    return this.inferenceManager.explainInference(atom);
  }
}