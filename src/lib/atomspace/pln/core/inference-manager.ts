import { Atom } from '../../types';
import { PLNConfig } from '../config/pln-config';
import { InferenceTracker } from './inference-tracker';
import { TruthValueManager } from './truth-value-manager';
import { InferenceValidator } from './inference-validator';

export class InferenceManager {
  private tracker: InferenceTracker;
  private tvManager: TruthValueManager;
  private validator: InferenceValidator;

  constructor(private config: PLNConfig) {
    this.tracker = new InferenceTracker();
    this.tvManager = new TruthValueManager(config);
    this.validator = new InferenceValidator(config);
  }

  processInferences(
    inferences: Atom[],
    atomSpace: Map<string, Atom>
  ): Atom[] {
    return inferences
      .filter(inference => this.validator.validateInference(inference))
      .map(inference => this.processInference(inference, atomSpace));
  }

  private processInference(
    inference: Atom,
    atomSpace: Map<string, Atom>
  ): Atom {
    // Adjust truth values based on existing knowledge
    const adjustedTv = this.adjustTruthValue(inference, atomSpace);

    // Track the inference
    this.tracker.recordInference({
      ...inference,
      truthValue: adjustedTv
    });

    return {
      ...inference,
      truthValue: adjustedTv
    };
  }

  private adjustTruthValue(
    inference: Atom,
    atomSpace: Map<string, Atom>
  ): TruthValue {
    if (!inference.truthValue) {
      throw new Error('Inference must have a truth value');
    }

    // Check for existing atom with same content
    const existing = this.findExistingAtom(inference, atomSpace);
    if (existing?.truthValue) {
      return this.tvManager.mergeTruthValues(
        inference.truthValue,
        existing.truthValue
      );
    }

    return inference.truthValue;
  }

  private findExistingAtom(
    inference: Atom,
    atomSpace: Map<string, Atom>
  ): Atom | undefined {
    return Array.from(atomSpace.values()).find(atom =>
      atom.type === inference.type &&
      atom.name === inference.name &&
      JSON.stringify(atom.outgoing) === JSON.stringify(inference.outgoing)
    );
  }

  explainInference(atom: Atom): string {
    const chain = this.tracker.getInferenceChain(atom);
    if (chain.length === 0) {
      return 'No inference history available for this atom.';
    }

    return chain
      .map((step, index) => {
        const { rule, sourceAtoms } = step;
        return `${index + 1}. Applied ${rule.name}: ${sourceAtoms.map(a => a.name).join(', ')}`;
      })
      .join('\n');
  }
}