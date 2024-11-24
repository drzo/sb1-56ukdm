import { Atom, TruthValue } from '../../types';
import { PLNConfig } from '../config/pln-config';
import { TruthValueValidator } from '../truth-values/validation/truth-value-validator';

export class InferenceValidator {
  private tvValidator: TruthValueValidator;

  constructor(private config: PLNConfig) {
    this.tvValidator = new TruthValueValidator();
  }

  validateInference(inference: Atom): boolean {
    return this.validateBasicStructure(inference) &&
           this.validateTruthValue(inference) &&
           this.validateConfidenceThreshold(inference);
  }

  private validateBasicStructure(inference: Atom): boolean {
    return inference.id !== undefined &&
           inference.type !== undefined &&
           inference.name !== undefined;
  }

  private validateTruthValue(inference: Atom): boolean {
    return inference.truthValue !== undefined &&
           this.tvValidator.validate(inference.truthValue);
  }

  private validateConfidenceThreshold(inference: Atom): boolean {
    if (!inference.truthValue) return false;

    const { strength, confidence } = inference.truthValue;
    return strength * confidence >= this.config.minConfidence;
  }

  validateInferenceChain(chain: Atom[]): boolean {
    return chain.every((atom, index) => {
      if (index === 0) return this.validateInference(atom);
      
      const prev = chain[index - 1];
      return this.validateInference(atom) &&
             this.validateInferenceConnection(prev, atom);
    });
  }

  private validateInferenceConnection(
    source: Atom,
    target: Atom
  ): boolean {
    // Check if atoms are connected through outgoing links
    if (source.outgoing?.includes(target.id)) return true;
    if (target.outgoing?.includes(source.id)) return true;

    // Check if they share common variables or patterns
    return this.hasCommonElements(source, target);
  }

  private hasCommonElements(atom1: Atom, atom2: Atom): boolean {
    const elements1 = new Set([
      atom1.id,
      ...(atom1.outgoing || [])
    ]);

    return atom2.id in elements1 ||
           (atom2.outgoing || []).some(id => elements1.has(id));
  }
}