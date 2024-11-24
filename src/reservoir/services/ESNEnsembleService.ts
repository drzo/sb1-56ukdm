import { MultiReservoirManager } from '../core/MultiReservoirManager';
import { ESNOptimizer } from '../optimization/ESNOptimizer';
import { ESNConfig, ESNMetrics, TrainingData } from '../types/ESNTypes';
import { Logger } from '../../cogutil/Logger';
import { Timer } from '../../cogutil/Timer';

export class ESNEnsembleService {
  private static instance: ESNEnsembleService;
  private manager: MultiReservoirManager;

  private constructor() {
    this.manager = MultiReservoirManager.getInstance();
  }

  public static getInstance(): ESNEnsembleService {
    if (!ESNEnsembleService.instance) {
      ESNEnsembleService.instance = new ESNEnsembleService();
    }
    return ESNEnsembleService.instance;
  }

  async createOptimalEnsemble(
    baseConfig: ESNConfig,
    validationData: TrainingData,
    numReservoirs: number = 3
  ): Promise<string[]> {
    const timer = new Timer();
    try {
      const reservoirIds: string[] = [];

      // Create diverse configurations
      for (let i = 0; i < numReservoirs; i++) {
        const id = `reservoir-${i + 1}`;
        const optimizedConfig = await ESNOptimizer.optimizeHyperparameters(
          baseConfig,
          async (config) => {
            const reservoir = new ReservoirAtom(`temp-${id}`, config);
            const metrics = await reservoir.train(validationData);
            reservoir.dispose();
            return metrics;
          }
        );

        this.manager.addReservoir(id, optimizedConfig.config);
        reservoirIds.push(id);
      }

      // Optimize ensemble weights
      await this.manager.optimizeEnsemble(
        validationData.inputs.map((input, i) => ({
          input: new Float32Array(input),
          target: new Float32Array(validationData.targets[i])
        }))
      );

      Logger.info(`Created optimal ensemble with ${numReservoirs} reservoirs in ${timer.stop()}ms`);
      return reservoirIds;
    } catch (error) {
      Logger.error('Failed to create optimal ensemble:', error);
      throw error;
    }
  }

  async evaluateEnsemble(data: TrainingData): Promise<ESNMetrics> {
    const timer = new Timer();
    try {
      let totalError = 0;
      let totalStability = 0;

      for (let i = 0; i < data.inputs.length; i++) {
        const input = new Float32Array(data.inputs[i]);
        const target = new Float32Array(data.targets[i]);
        const output = await this.manager.processEnsemble(input);

        // Calculate error
        totalError += output.reduce((sum, val, j) => 
          sum + Math.pow(val - target[j], 2), 0
        );

        // Calculate stability
        if (i > 0) {
          const prevOutput = await this.manager.processEnsemble(
            new Float32Array(data.inputs[i - 1])
          );
          totalStability += output.reduce((sum, val, j) => 
            sum + Math.pow(val - prevOutput[j], 2), 0
          );
        }
      }

      const metrics: ESNMetrics = {
        accuracy: 1 - Math.min(1, totalError / data.inputs.length),
        complexity: this.calculateEnsembleComplexity(),
        stability: Math.exp(-totalStability / (data.inputs.length - 1)),
        timestamp: Date.now()
      };

      Logger.info(`Ensemble evaluation completed in ${timer.stop()}ms`);
      return metrics;
    } catch (error) {
      Logger.error('Failed to evaluate ensemble:', error);
      throw error;
    }
  }

  private calculateEnsembleComplexity(): number {
    const weights = this.manager.getEnsembleWeights();
    const entropy = Array.from(weights.values()).reduce((sum, weight) => {
      if (weight > 0) {
        return sum - weight * Math.log2(weight);
      }
      return sum;
    }, 0);
    return entropy / Math.log2(weights.size);
  }

  getEnsembleSize(): number {
    return this.manager.getReservoirIds().length;
  }

  getEnsembleWeights(): Map<string, number> {
    return this.manager.getEnsembleWeights();
  }

  dispose(): void {
    this.manager.dispose();
  }
}