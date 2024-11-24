import { ESNConfig } from '../../types/ESNTypes';
import { Logger } from '../../../cogutil/Logger';

export class OptimizationValidator {
  static validateSearchSpace(searchSpace: Record<string, [number, number]>): void {
    const errors: string[] = [];

    Object.entries(searchSpace).forEach(([param, [min, max]]) => {
      if (min >= max) {
        errors.push(`Invalid range for ${param}: min (${min}) must be less than max (${max})`);
      }
      if (min < 0) {
        errors.push(`Invalid minimum value for ${param}: must be non-negative`);
      }
    });

    if (errors.length > 0) {
      Logger.error('Invalid search space:', errors);
      throw new Error(`Invalid search space: ${errors.join(', ')}`);
    }
  }

  static validateOptimizationConfig(config: {
    populationSize?: number;
    generations?: number;
    mutationRate?: number;
  }): void {
    const errors: string[] = [];

    if (config.populationSize !== undefined && config.populationSize < 2) {
      errors.push('Population size must be at least 2');
    }
    if (config.generations !== undefined && config.generations < 1) {
      errors.push('Number of generations must be at least 1');
    }
    if (config.mutationRate !== undefined && 
        (config.mutationRate < 0 || config.mutationRate > 1)) {
      errors.push('Mutation rate must be between 0 and 1');
    }

    if (errors.length > 0) {
      Logger.error('Invalid optimization config:', errors);
      throw new Error(`Invalid optimization config: ${errors.join(', ')}`);
    }
  }
}