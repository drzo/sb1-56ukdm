import { ReservoirAtom } from '../ReservoirAtom';
import { ESNConfig, ESNMetrics } from '../types/ESNTypes';
import { Logger } from '../../cogutil/Logger';
import { Timer } from '../../cogutil/Timer';
import * as tf from '@tensorflow/tfjs';

export class MultiReservoirManager {
  private static instance: MultiReservoirManager;
  private reservoirs: Map<string, ReservoirAtom>;
  private ensembleWeights: Map<string, number>;

  private constructor() {
    this.reservoirs = new Map();
    this.ensembleWeights = new Map();
  }

  public static getInstance(): MultiReservoirManager {
    if (!MultiReservoirManager.instance) {
      MultiReservoirManager.instance = new MultiReservoirManager();
    }
    return MultiReservoirManager.instance;
  }

  async addReservoir(id: string, config: ESNConfig): Promise<void> {
    const timer = new Timer();
    try {
      if (this.reservoirs.has(id)) {
        throw new Error(`Reservoir ${id} already exists`);
      }

      // Create new reservoir with the provided config
      const reservoir = new ReservoirAtom(id);
      await reservoir.initialize(config);

      this.reservoirs.set(id, reservoir);
      this.ensembleWeights.set(id, 1 / (this.reservoirs.size));
      this.rebalanceWeights();
      
      Logger.info(`Added reservoir ${id} to ensemble in ${timer.stop()}ms`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      Logger.error(`Failed to add reservoir ${id}:`, message);
      throw new Error(`Failed to add reservoir ${id}: ${message}`);
    }
  }

  async processEnsemble(input: Float32Array): Promise<Float32Array> {
    const timer = new Timer();
    try {
      const outputs = await Promise.all(
        Array.from(this.reservoirs.entries()).map(async ([id, reservoir]) => {
          const output = await reservoir.process(input);
          const weight = this.ensembleWeights.get(id) || 0;
          return tf.tensor1d(output).mul(weight);
        })
      );

      const combinedOutput = tf.tidy(() => {
        const stacked = tf.stack(outputs);
        return tf.sum(stacked, 0);
      });

      const result = await combinedOutput.array();
      Logger.debug(`Ensemble processing completed in ${timer.stop()}ms`);
      return new Float32Array(result);
    } catch (error) {
      Logger.error('Ensemble processing failed:', error);
      throw error;
    }
  }

  async optimizeEnsemble(validationData: Array<{
    input: Float32Array;
    target: Float32Array;
  }>): Promise<void> {
    const timer = new Timer();
    try {
      // Calculate individual performances
      const performances = await Promise.all(
        Array.from(this.reservoirs.entries()).map(async ([id, reservoir]) => {
          let totalError = 0;
          for (const { input, target } of validationData) {
            const output = await reservoir.process(input);
            totalError += output.reduce((sum, val, i) => 
              sum + Math.pow(val - target[i], 2), 0
            );
          }
          return {
            id,
            error: totalError / validationData.length
          };
        })
      );

      // Update weights based on inverse error
      const totalInverseError = performances.reduce((sum, p) => 
        sum + (1 / (p.error + 1e-10)), 0
      );

      performances.forEach(({ id, error }) => {
        const weight = (1 / (error + 1e-10)) / totalInverseError;
        this.ensembleWeights.set(id, weight);
      });

      Logger.info(`Ensemble optimization completed in ${timer.stop()}ms`);
    } catch (error) {
      Logger.error('Ensemble optimization failed:', error);
      throw error;
    }
  }

  private rebalanceWeights(): void {
    const totalWeight = Array.from(this.ensembleWeights.values())
      .reduce((sum, weight) => sum + weight, 0);
    
    if (Math.abs(totalWeight - 1) > 1e-6) {
      this.ensembleWeights.forEach((weight, id) => {
        this.ensembleWeights.set(id, weight / totalWeight);
      });
    }
  }

  getReservoir(id: string): ReservoirAtom | undefined {
    return this.reservoirs.get(id);
  }

  getReservoirIds(): string[] {
    return Array.from(this.reservoirs.keys());
  }

  getEnsembleWeights(): Map<string, number> {
    return new Map(this.ensembleWeights);
  }

  dispose(): void {
    for (const reservoir of this.reservoirs.values()) {
      reservoir.dispose();
    }
    this.reservoirs.clear();
    this.ensembleWeights.clear();
  }
}