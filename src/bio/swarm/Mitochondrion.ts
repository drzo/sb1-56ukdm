import { Logger } from '../../cogutil/Logger';
import { MitochondrialProfile } from '../training/MitochondrialProfile';
import { MitochondrialChatbot } from './MitochondrialChatbot';
import { NoveltyMetrics, AutonomyMetrics } from './types';

export class Mitochondrion {
  private efficiency: number;
  private damageLevel: number;
  private energyOutput: number;
  private fusionState: boolean;
  private age: number;
  private profile: MitochondrialProfile;
  private chatbot: MitochondrialChatbot;
  private noveltyMetrics: NoveltyMetrics;
  private autonomyMetrics: AutonomyMetrics;

  constructor() {
    this.efficiency = 1.0;
    this.damageLevel = 0;
    this.energyOutput = 1.0;
    this.fusionState = false;
    this.age = 0;
    this.profile = new MitochondrialProfile();
    this.chatbot = new MitochondrialChatbot(this.profile);
    this.noveltyMetrics = this.initializeNoveltyMetrics();
    this.autonomyMetrics = this.initializeAutonomyMetrics();
  }

  private initializeNoveltyMetrics(): NoveltyMetrics {
    return {
      behaviorDiversity: 0.5,
      adaptationRate: 0.5,
      creativityScore: 0.5,
      innovationIndex: 0.5
    };
  }

  private initializeAutonomyMetrics(): AutonomyMetrics {
    return {
      decisionIndependence: 0.5,
      selfRegulation: 0.5,
      proactiveActions: 0,
      learningRate: 0.1
    };
  }

  async update(): Promise<void> {
    try {
      this.age++;
      this.accumulateDamage();
      this.updateEfficiency();
      this.updateEnergyOutput();
      this.updateNoveltyMetrics();
      this.updateAutonomyMetrics();
    } catch (error) {
      Logger.error('Failed to update mitochondrion:', error);
    }
  }

  private accumulateDamage(): void {
    const baseDamage = 0.001;
    const randomFactor = Math.random() * 0.002;
    this.damageLevel = Math.min(1, this.damageLevel + baseDamage + randomFactor);
  }

  private updateEfficiency(): void {
    const ageFactor = Math.max(0, 1 - (this.age * 0.0001));
    const damageFactor = 1 - this.damageLevel;
    this.efficiency = Math.max(0.1, ageFactor * damageFactor);
  }

  private updateEnergyOutput(): void {
    const fusionBonus = this.fusionState ? 0.2 : 0;
    this.energyOutput = this.efficiency * (1 + fusionBonus);
  }

  private updateNoveltyMetrics(): void {
    this.noveltyMetrics.behaviorDiversity = Math.min(
      1,
      this.noveltyMetrics.behaviorDiversity + 
      (Math.random() - 0.5) * 0.1
    );

    this.noveltyMetrics.adaptationRate = Math.min(
      1,
      this.efficiency * (1 - this.damageLevel)
    );

    this.noveltyMetrics.creativityScore = Math.min(
      1,
      this.noveltyMetrics.creativityScore +
      (this.noveltyMetrics.adaptationRate - 0.5) * 0.1
    );

    this.noveltyMetrics.innovationIndex = (
      this.noveltyMetrics.behaviorDiversity +
      this.noveltyMetrics.adaptationRate +
      this.noveltyMetrics.creativityScore
    ) / 3;
  }

  private updateAutonomyMetrics(): void {
    this.autonomyMetrics.decisionIndependence = Math.min(
      1,
      this.autonomyMetrics.decisionIndependence +
      (this.efficiency - 0.5) * 0.1
    );

    this.autonomyMetrics.selfRegulation = Math.min(
      1,
      (1 - this.damageLevel) * (1 + this.efficiency) / 2
    );

    if (this.efficiency > 0.7 && this.damageLevel < 0.3) {
      this.autonomyMetrics.proactiveActions++;
    }

    this.autonomyMetrics.learningRate = Math.min(
      0.5,
      this.autonomyMetrics.learningRate +
      (this.noveltyMetrics.adaptationRate - 0.5) * 0.01
    );
  }

  fusionWith(other: Mitochondrion): void {
    if (!this.fusionState && !other.fusionState) {
      this.fusionState = true;
      other.fusionState = true;
      this.efficiency = (this.efficiency + other.efficiency) / 2;
      Logger.debug('Fusion completed successfully');
    }
  }

  divide(): Mitochondrion | null {
    if (this.efficiency > 0.5 && this.damageLevel < 0.3) {
      const newMito = new Mitochondrion();
      newMito.efficiency = this.efficiency * 0.9;
      newMito.damageLevel = this.damageLevel;
      this.efficiency *= 0.9;
      Logger.debug('Division completed successfully');
      return newMito;
    }
    return null;
  }

  getEfficiency(): number {
    return this.efficiency;
  }

  getDamageLevel(): number {
    return this.damageLevel;
  }

  getEnergyOutput(): number {
    return this.energyOutput;
  }

  getNoveltyMetrics(): NoveltyMetrics {
    return { ...this.noveltyMetrics };
  }

  getAutonomyMetrics(): AutonomyMetrics {
    return { ...this.autonomyMetrics };
  }

  getProfile(): MitochondrialProfile {
    return this.profile;
  }

  async communicate(message: string): Promise<string> {
    try {
      const status = {
        count: 1,
        efficiency: this.efficiency,
        fusion: this.fusionState ? 1 : 0,
        fission: 0,
        damage: this.damageLevel,
        energyOutput: this.energyOutput,
        personality: this.profile.getProfile()
      };

      return await this.chatbot.processMessage(message, status);
    } catch (error) {
      Logger.error('Communication failed:', error);
      throw error;
    }
  }
}