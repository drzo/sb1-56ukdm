import { Atom } from '../../types';
import { PLNConfig } from '../config/pln-config';
import { RuleExecutor } from './rule-executor';
import { InferenceTracker } from './inference-tracker';
import { TruthValueManager } from './truth-value-manager';
import { AttentionManager } from '../../attention/ecan/core/attention-manager';

export class PLNEngine {
  private ruleExecutor: RuleExecutor;
  private inferenceTracker: InferenceTracker;
  private tvManager: TruthValueManager;

  constructor(
    private atomSpace: Map<string, Atom>,
    private attentionManager: AttentionManager,
    private config: PLNConfig
  ) {
    this.ruleExecutor = new RuleExecutor(atomSpace, config);
    this.inferenceTracker = new InferenceTracker();
    this.tvManager = new TruthValueManager(config);
  }

  inferenceStep(): Atom[] {
    const candidates = this.selectInferenceCandidates();
    const newInferences: Atom[] = [];

    for (const atoms of candidates) {
      const inferences = this.ruleExecutor.executeRules(atoms);
      
      for (const inference of inferences) {
        if (this.isSignificantInference(inference)) {
          this.processNewInference(inference, atoms);
          newInferences.push(inference);
        }
      }
    }

    return newInferences;
  }

  private selectInferenceCandidates(): Atom[][] {
    const atoms = Array.from(this.atomSpace.values());
    const significantAtoms = atoms.filter(atom => 
      this.isSignificantAtom(atom)
    );

    return this.generateCombinations(significantAtoms);
  }

  private isSignificantAtom(atom: Atom): boolean {
    return atom.truthValue !== undefined &&
           atom.attention !== undefined &&
           atom.attention.sti > this.config.attentionThreshold;
  }

  private isSignificantInference(inference: Atom): boolean {
    return inference.truthValue !== undefined &&
           inference.truthValue.strength * inference.truthValue.confidence >
           this.config.minConfidence;
  }

  private processNewInference(inference: Atom, sourceAtoms: Atom[]): void {
    // Track inference
    this.inferenceTracker.recordInference(inference, sourceAtoms);

    // Update attention values
    this.updateAttentionValues(inference, sourceAtoms);

    // Add to atom space
    this.atomSpace.set(inference.id, inference);
  }

  private updateAttentionValues(inference: Atom, sourceAtoms: Atom[]): void {
    // Stimulate source atoms
    sourceAtoms.forEach(atom => {
      this.attentionManager.stimulateAtom(atom, 1);
    });

    // Set initial attention for inference
    if (inference.attention) {
      this.attentionManager.stimulateAtom(
        inference,
        this.calculateInitialStimulus(inference)
      );
    }
  }

  private calculateInitialStimulus(inference: Atom): number {
    if (!inference.truthValue) return 1;
    return inference.truthValue.strength * 
           inference.truthValue.confidence * 10;
  }

  private generateCombinations(atoms: Atom[]): Atom[][] {
    const combinations: Atom[][] = [];
    
    for (let i = 0; i < atoms.length; i++) {
      for (let j = i + 1; j < atoms.length; j++) {
        combinations.push([atoms[i], atoms[j]]);
        
        // Generate triplets for rules that need three atoms
        for (let k = j + 1; k < atoms.length; k++) {
          combinations.push([atoms[i], atoms[j], atoms[k]]);
        }
      }
    }

    return combinations;
  }
}