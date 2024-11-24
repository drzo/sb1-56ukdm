import { Logger } from '../../cogutil/Logger';
import { MitochondrialLanguageModel } from './MitochondrialLanguageModel';
import { Mitochondrion } from './Mitochondrion';

export class MitochondrialNetwork {
  private mitochondria: Mitochondrion[];
  private languageModel: MitochondrialLanguageModel;
  private networkState: {
    fusionRate: number;
    fissionRate: number;
    damageLevel: number;
    efficiency: number;
  };

  constructor(count: number) {
    this.mitochondria = Array(count).fill(null).map(() => new Mitochondrion());
    this.languageModel = new MitochondrialLanguageModel();
    this.networkState = {
      fusionRate: 0.1,
      fissionRate: 0.1,
      damageLevel: 0,
      efficiency: 1.0
    };
    Logger.info(`Mitochondrial network initialized with ${count} mitochondria`);
  }

  async update(): Promise<void> {
    await Promise.all(this.mitochondria.map(m => m.update()));
    this.updateNetworkDynamics();
    this.adaptToConditions();
  }

  private updateNetworkDynamics(): void {
    this.processFusionFission();
    this.updateEfficiency();
    this.processDamage();
  }

  private processFusionFission(): void {
    const networkSize = this.mitochondria.length;
    
    const fusionEvents = Math.floor(networkSize * this.networkState.fusionRate);
    for (let i = 0; i < fusionEvents; i++) {
      const indices = this.getRandomPair();
      if (indices) {
        const [m1, m2] = indices.map(idx => this.mitochondria[idx]);
        m1.fusionWith(m2);
      }
    }

    const fissionEvents = Math.floor(networkSize * this.networkState.fissionRate);
    for (let i = 0; i < fissionEvents; i++) {
      const index = Math.floor(Math.random() * networkSize);
      const newMitochondrion = this.mitochondria[index].divide();
      if (newMitochondrion) {
        this.mitochondria.push(newMitochondrion);
      }
    }
  }

  private updateEfficiency(): void {
    const individualEfficiencies = this.mitochondria.map(m => m.getEfficiency());
    this.networkState.efficiency = individualEfficiencies.reduce((a, b) => a + b, 0) / 
      this.mitochondria.length;
  }

  private processDamage(): void {
    this.networkState.damageLevel = this.mitochondria.reduce(
      (total, mito) => total + mito.getDamageLevel(), 0
    ) / this.mitochondria.length;
  }

  private adaptToConditions(): void {
    if (this.networkState.damageLevel > 0.5) {
      this.networkState.fissionRate += 0.05;
      this.networkState.fusionRate -= 0.02;
    } else {
      this.networkState.fusionRate += 0.02;
      this.networkState.fissionRate -= 0.01;
    }

    this.networkState.fusionRate = Math.max(0.05, Math.min(0.3, this.networkState.fusionRate));
    this.networkState.fissionRate = Math.max(0.05, Math.min(0.3, this.networkState.fissionRate));
  }

  getStatus(): {
    count: number;
    efficiency: number;
    fusion: number;
    fission: number;
    damage: number;
    energyOutput: number;
  } {
    return {
      count: this.mitochondria.length,
      efficiency: this.networkState.efficiency,
      fusion: this.networkState.fusionRate,
      fission: this.networkState.fissionRate,
      damage: this.networkState.damageLevel,
      energyOutput: this.mitochondria.reduce((sum, m) => sum + m.getEnergyOutput(), 0)
    };
  }

  private getRandomPair(): [number, number] | null {
    if (this.mitochondria.length < 2) return null;
    
    const i = Math.floor(Math.random() * this.mitochondria.length);
    let j;
    do {
      j = Math.floor(Math.random() * this.mitochondria.length);
    } while (i === j);
    
    return [i, j];
  }
}