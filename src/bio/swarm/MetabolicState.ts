import { Logger } from '../../cogutil/Logger';

export interface MetabolicStatus {
  atpLevel: number;
  nutrientLevels: {
    glucose: number;
    oxygen: number;
    amino_acids: number;
  };
  stressLevel: number;
  redoxState: number;
}

export class MetabolicState {
  private atpLevel: number;
  private nutrientLevels: {
    glucose: number;
    oxygen: number;
    amino_acids: number;
  };
  private stressLevel: number;
  private redoxState: number;

  constructor() {
    this.atpLevel = 1.0;
    this.nutrientLevels = {
      glucose: 1.0,
      oxygen: 1.0,
      amino_acids: 1.0
    };
    this.stressLevel = 0;
    this.redoxState = 0.5;
  }

  update(energyProduction: number): void {
    try {
      // Update ATP levels based on energy production
      this.atpLevel = Math.min(1.0, this.atpLevel + energyProduction * 0.1);

      // Consume nutrients
      this.consumeNutrients(energyProduction);

      // Update stress and redox state
      this.updateStressState();
    } catch (error) {
      Logger.error('Failed to update metabolic state:', error);
    }
  }

  private consumeNutrients(energyProduction: number): void {
    const consumptionRate = energyProduction * 0.05;
    this.nutrientLevels.glucose = Math.max(0, this.nutrientLevels.glucose - consumptionRate);
    this.nutrientLevels.oxygen = Math.max(0, this.nutrientLevels.oxygen - consumptionRate);
    this.nutrientLevels.amino_acids = Math.max(0, this.nutrientLevels.amino_acids - consumptionRate * 0.5);
  }

  private updateStressState(): void {
    // Calculate stress based on nutrient availability and ATP levels
    const nutrientStress = 1 - (
      this.nutrientLevels.glucose +
      this.nutrientLevels.oxygen +
      this.nutrientLevels.amino_acids
    ) / 3;

    const energyStress = 1 - this.atpLevel;

    this.stressLevel = (nutrientStress + energyStress) / 2;

    // Update redox state
    this.redoxState = Math.max(0, Math.min(1,
      this.redoxState + (Math.random() - 0.5) * 0.1
    ));
  }

  getATPLevel(): number {
    return this.atpLevel;
  }

  getNutrientLevels(): typeof this.nutrientLevels {
    return { ...this.nutrientLevels };
  }

  getStressLevel(): number {
    return this.stressLevel;
  }

  getRedoxState(): number {
    return this.redoxState;
  }

  getStatus(): MetabolicStatus {
    return {
      atpLevel: this.atpLevel,
      nutrientLevels: { ...this.nutrientLevels },
      stressLevel: this.stressLevel,
      redoxState: this.redoxState
    };
  }
}