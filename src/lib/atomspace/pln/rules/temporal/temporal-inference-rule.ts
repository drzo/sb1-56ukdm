import { Atom, TruthValue } from '../../../types';
import { BasePLNRule } from '../base/base-rule';

export class TemporalInferenceRule extends BasePLNRule {
  readonly name = 'TemporalInference';
  readonly description = 'Infer temporal properties and relationships through reasoning';
  readonly category = 'Temporal';
  readonly computationalCost = 0.8;

  applyRule(atoms: Atom[]): Atom[] {
    if (!this.validateAtoms(atoms, 3)) return [];
    
    const [premise1, premise2, timeContext] = atoms;
    if (!premise1.truthValue || !premise2.truthValue || !timeContext.truthValue) return [];

    // Infer temporal conclusion
    const inferredTv = this.inferTemporalConclusion(premise1, premise2, timeContext);
    
    return [this.createResultAtom(
      `temporal-inf-${premise1.id}-${premise2.id}`,
      'TemporalInferenceLink',
      `TemporalInference(${premise1.name},${premise2.name})`,
      [premise1.id, premise2.id, timeContext.id],
      inferredTv
    )];
  }

  private inferTemporalConclusion(
    premise1: Atom,
    premise2: Atom,
    timeContext: Atom
  ): TruthValue {
    const temporalStrength = this.calculateTemporalStrength(
      premise1,
      premise2,
      timeContext
    );

    const temporalConfidence = this.calculateTemporalConfidence(
      premise1,
      premise2,
      timeContext
    );

    return {
      strength: temporalStrength,
      confidence: temporalConfidence
    };
  }

  private calculateTemporalStrength(
    premise1: Atom,
    premise2: Atom,
    timeContext: Atom
  ): number {
    const baseStrength = Math.min(
      premise1.truthValue!.strength,
      premise2.truthValue!.strength
    );

    const temporalFactor = this.getTemporalConsistency(
      premise1,
      premise2,
      timeContext
    );

    return baseStrength * temporalFactor * timeContext.truthValue!.strength;
  }

  private calculateTemporalConfidence(
    premise1: Atom,
    premise2: Atom,
    timeContext: Atom
  ): number {
    return Math.min(
      premise1.truthValue!.confidence,
      premise2.truthValue!.confidence,
      timeContext.truthValue!.confidence
    ) * 0.9;
  }

  private getTemporalConsistency(
    premise1: Atom,
    premise2: Atom,
    timeContext: Atom
  ): number {
    const time1 = this.getTimeValue(premise1);
    const time2 = this.getTimeValue(premise2);
    const contextTime = this.getTimeValue(timeContext);

    const timeDiff1 = Math.abs(time1 - contextTime);
    const timeDiff2 = Math.abs(time2 - contextTime);
    const maxDiff = Math.max(timeDiff1, timeDiff2);

    return Math.exp(-maxDiff / this.getTemporalScale(timeContext));
  }

  private getTimeValue(atom: Atom): number {
    return atom.value?.time ?? 0;
  }

  private getTemporalScale(context: Atom): number {
    return context.value?.scale ?? 1;
  }

  validate(atoms: Atom[]): boolean {
    return super.validateAtoms(atoms, 3) &&
           atoms.every(atom => atom.truthValue !== undefined);
  }
}