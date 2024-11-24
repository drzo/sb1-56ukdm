import { Atom } from '../../types/Atom';
import { Node } from '../../types/Node';
import { Link } from '../../types/Link';
import { NodeType, LinkType } from '../../types/AtomTypes';
import { Logger } from '../../cogutil/Logger';
import { Statistics } from '../../cogutil/Statistics';

export class PLNReasoner {
  // Probabilistic Logic Networks reasoning
  async deductiveInference(
    premises: Link[],
    conclusion: Link
  ): Promise<{ valid: boolean; confidence: number }> {
    try {
      const premiseStrengths = premises.map(p => p.getTruthValue().strength);
      const premiseConfidences = premises.map(p => p.getTruthValue().confidence);

      const strengthResult = Statistics.mean(premiseStrengths);
      const confidenceResult = Math.min(...premiseConfidences) * 0.9;

      return {
        valid: strengthResult > 0.5 && confidenceResult > 0.3,
        confidence: confidenceResult
      };
    } catch (error) {
      Logger.error('Deductive inference failed:', error);
      throw error;
    }
  }

  async abductiveInference(
    observation: Link,
    explanation: Link
  ): Promise<{ plausible: boolean; probability: number }> {
    try {
      const obsTV = observation.getTruthValue();
      const expTV = explanation.getTruthValue();

      const probability = (obsTV.strength * expTV.strength) /
        (obsTV.strength * expTV.strength + (1 - obsTV.strength) * (1 - expTV.strength));

      return {
        plausible: probability > 0.5,
        probability
      };
    } catch (error) {
      Logger.error('Abductive inference failed:', error);
      throw error;
    }
  }

  async inductiveGeneralization(
    instances: Atom[],
    generalConcept: Node
  ): Promise<{ strength: number; confidence: number }> {
    try {
      const instanceStrengths = instances.map(i => i.getTruthValue().strength);
      const instanceConfidences = instances.map(i => i.getTruthValue().confidence);

      return {
        strength: Statistics.mean(instanceStrengths),
        confidence: Math.min(
          Statistics.mean(instanceConfidences),
          1 / Math.sqrt(instances.length)
        )
      };
    } catch (error) {
      Logger.error('Inductive generalization failed:', error);
      throw error;
    }
  }
}