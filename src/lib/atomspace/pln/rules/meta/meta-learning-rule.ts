import { Atom, TruthValue } from '../../../types';
import { BasePLNRule } from '../base/base-rule';

export class MetaLearningRule extends BasePLNRule {
  readonly name = 'MetaLearning';
  readonly description = 'Learn and adapt inference strategies based on past performance';
  readonly category = 'Meta';
  readonly computationalCost = 1.0;

  private successHistory: Map<string, number> = new Map();
  private totalAttempts: Map<string, number> = new Map();

  applyRule(atoms: Atom[]): Atom[] {
    if (!this.validateAtoms(atoms, 3)) return [];
    
    const [inferencePattern, context, history] = atoms;
    if (!inferencePattern.truthValue || !context.truthValue || !history.truthValue) return [];

    // Update learning history
    this.updateHistory(inferencePattern.id, history.truthValue.strength > 0.5);

    // Calculate success rate and confidence
    const successRate = this.getSuccessRate(inferencePattern.id);
    const confidence = this.calculateConfidence(inferencePattern.id);

    // Create meta-learning result
    const metaLearningTv: TruthValue = {
      strength: successRate * inferencePattern.truthValue.strength,
      confidence: Math.min(
        confidence,
        inferencePattern.truthValue.confidence,
        context.truthValue.confidence
      ) * 0.9
    };

    return [this.createResultAtom(
      `meta-learning-${inferencePattern.id}`,
      'MetaLearningLink',
      `MetaLearning(${inferencePattern.name})`,
      [inferencePattern.id, context.id],
      metaLearningTv
    )];
  }

  private updateHistory(patternId: string, success: boolean): void {
    const currentSuccesses = this.successHistory.get(patternId) || 0;
    const currentAttempts = this.totalAttempts.get(patternId) || 0;

    this.successHistory.set(patternId, currentSuccesses + (success ? 1 : 0));
    this.totalAttempts.set(patternId, currentAttempts + 1);
  }

  private getSuccessRate(patternId: string): number {
    const successes = this.successHistory.get(patternId) || 0;
    const attempts = this.totalAttempts.get(patternId) || 1;
    return successes / attempts;
  }

  private calculateConfidence(patternId: string): number {
    const attempts = this.totalAttempts.get(patternId) || 0;
    return Math.min(1, attempts / 10); // Confidence increases with more attempts
  }

  validate(atoms: Atom[]): boolean {
    return super.validateAtoms(atoms, 3) &&
           atoms.every(atom => atom.truthValue !== undefined);
  }
}