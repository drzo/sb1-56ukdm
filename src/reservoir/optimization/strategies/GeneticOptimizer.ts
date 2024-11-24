import { ESNConfig, ESNMetrics } from '../../types/ESNTypes';
import { Logger } from '../../../cogutil/Logger';

export class GeneticOptimizer {
  private readonly populationSize: number;
  private readonly generations: number;
  private readonly mutationRate: number;
  private readonly eliteCount: number;

  constructor(
    populationSize: number = 20,
    generations: number = 50,
    mutationRate: number = 0.1,
    eliteCount: number = 2
  ) {
    this.populationSize = populationSize;
    this.generations = generations;
    this.mutationRate = mutationRate;
    this.eliteCount = eliteCount;
  }

  async optimize(
    baseConfig: ESNConfig,
    evaluateConfig: (config: ESNConfig) => Promise<ESNMetrics>
  ): Promise<{ config: ESNConfig; metrics: ESNMetrics }> {
    try {
      // Initialize population
      let population = this.initializePopulation(baseConfig);
      let bestResult: { config: ESNConfig; metrics: ESNMetrics } | null = null;

      // Evolution loop
      for (let gen = 0; gen < this.generations; gen++) {
        // Evaluate population
        const results = await Promise.all(
          population.map(async config => ({
            config,
            metrics: await evaluateConfig(config)
          }))
        );

        // Sort by fitness
        results.sort((a, b) => 
          (b.metrics.accuracy + b.metrics.stability) -
          (a.metrics.accuracy + a.metrics.stability)
        );

        // Update best result
        if (!bestResult || 
            (results[0].metrics.accuracy + results[0].metrics.stability) >
            (bestResult.metrics.accuracy + bestResult.metrics.stability)) {
          bestResult = results[0];
        }

        // Create next generation
        const elite = results.slice(0, this.eliteCount).map(r => r.config);
        const parents = results.slice(0, 10).map(r => r.config);
        population = [
          ...elite,
          ...this.crossover(parents),
          ...this.generateRandomConfigs(4, baseConfig)
        ];

        // Apply mutations
        population = population.map(config =>
          Math.random() < this.mutationRate ? this.mutate(config) : config
        );

        Logger.debug(`Generation ${gen + 1}: Best accuracy = ${results[0].metrics.accuracy}`);
      }

      return bestResult!;
    } catch (error) {
      Logger.error('Genetic optimization failed:', error);
      throw error;
    }
  }

  private initializePopulation(baseConfig: ESNConfig): ESNConfig[] {
    return [
      baseConfig,
      ...this.generateRandomConfigs(this.populationSize - 1, baseConfig)
    ];
  }

  private generateRandomConfigs(count: number, baseConfig: ESNConfig): ESNConfig[] {
    return Array.from({ length: count }, () => ({
      ...baseConfig,
      spectralRadius: this.randomFloat(0.1, 1.0),
      inputScaling: this.randomFloat(0.1, 2.0),
      leakingRate: this.randomFloat(0.1, 0.9),
      sparsity: this.randomFloat(0.1, 0.9)
    }));
  }

  private crossover(parents: ESNConfig[]): ESNConfig[] {
    const children: ESNConfig[] = [];
    
    while (children.length < this.populationSize - parents.length) {
      const parent1 = parents[Math.floor(Math.random() * parents.length)];
      const parent2 = parents[Math.floor(Math.random() * parents.length)];
      
      children.push({
        ...parent1,
        spectralRadius: (parent1.spectralRadius + parent2.spectralRadius) / 2,
        inputScaling: (parent1.inputScaling + parent2.inputScaling) / 2,
        leakingRate: (parent1.leakingRate + parent2.leakingRate) / 2,
        sparsity: (parent1.sparsity + parent2.sparsity) / 2
      });
    }

    return children;
  }

  private mutate(config: ESNConfig): ESNConfig {
    return {
      ...config,
      spectralRadius: this.mutateValue(config.spectralRadius, 0.1, 1.0),
      inputScaling: this.mutateValue(config.inputScaling, 0.1, 2.0),
      leakingRate: this.mutateValue(config.leakingRate, 0.1, 0.9),
      sparsity: this.mutateValue(config.sparsity, 0.1, 0.9)
    };
  }

  private mutateValue(value: number, min: number, max: number): number {
    const range = max - min;
    const mutation = (Math.random() - 0.5) * range * 0.2;
    return Math.max(min, Math.min(max, value + mutation));
  }

  private randomFloat(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }
}