import { Logger } from '../../cogutil/Logger';

export interface EnvironmentalSignals {
  nutrients: {
    glucose: number;
    oxygen: number;
    amino_acids: number;
  };
  stress: number;
  signals: Map<string, number>;
}

export class SignalingNetwork {
  private activeSignals: Map<string, number>;
  private stressLevel: number;
  private signalThresholds: Map<string, number>;

  constructor() {
    this.activeSignals = new Map();
    this.stressLevel = 0;
    this.signalThresholds = new Map([
      ['stress_response', 0.7],
      ['metabolic_shift', 0.6],
      ['survival', 0.8]
    ]);
  }

  processSignals(environmentalSignals: EnvironmentalSignals): void {
    try {
      // Update stress level
      this.updateStressLevel(environmentalSignals);

      // Process metabolic signals
      this.processMetabolicSignals(environmentalSignals.nutrients);

      // Update active signals
      this.updateActiveSignals();

    } catch (error) {
      Logger.error('Failed to process signals:', error);
    }
  }

  private updateStressLevel(signals: EnvironmentalSignals): void {
    const environmentalStress = signals.stress;
    const metabolicStress = this.calculateMetabolicStress(signals.nutrients);
    
    this.stressLevel = (environmentalStress + metabolicStress) / 2;
  }

  private calculateMetabolicStress(nutrients: EnvironmentalSignals['nutrients']): number {
    const glucoseStress = 1 - nutrients.glucose;
    const oxygenStress = 1 - nutrients.oxygen;
    const aminoAcidStress = 1 - nutrients.amino_acids;

    return (glucoseStress + oxygenStress + aminoAcidStress) / 3;
  }

  private processMetabolicSignals(nutrients: EnvironmentalSignals['nutrients']): void {
    // Process glucose availability
    if (nutrients.glucose < 0.3) {
      this.activeSignals.set('low_glucose', 1 - nutrients.glucose);
    } else {
      this.activeSignals.delete('low_glucose');
    }

    // Process oxygen availability
    if (nutrients.oxygen < 0.3) {
      this.activeSignals.set('hypoxia', 1 - nutrients.oxygen);
    } else {
      this.activeSignals.delete('hypoxia');
    }
  }

  private updateActiveSignals(): void {
    // Update stress response signals
    if (this.stressLevel > this.signalThresholds.get('stress_response')!) {
      this.activeSignals.set('stress_response', this.stressLevel);
    } else {
      this.activeSignals.delete('stress_response');
    }

    // Update metabolic signals
    if (this.stressLevel > this.signalThresholds.get('metabolic_shift')!) {
      this.activeSignals.set('metabolic_shift', this.stressLevel);
    } else {
      this.activeSignals.delete('metabolic_shift');
    }

    // Update survival signals
    if (this.stressLevel > this.signalThresholds.get('survival')!) {
      this.activeSignals.set('survival', this.stressLevel);
    } else {
      this.activeSignals.delete('survival');
    }
  }

  getStressLevel(): number {
    return this.stressLevel;
  }

  getActiveSignals(): Map<string, number> {
    return new Map(this.activeSignals);
  }

  isSignalActive(signalType: string): boolean {
    return this.activeSignals.has(signalType);
  }

  getSignalStrength(signalType: string): number {
    return this.activeSignals.get(signalType) || 0;
  }
}