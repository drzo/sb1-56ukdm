import { TrainingData } from '../types/ESNTypes';
import { Logger } from '../../cogutil/Logger';

export class BatchProcessor {
  createBatches(data: TrainingData, batchSize: number = 32): TrainingData[] {
    try {
      const batches: TrainingData[] = [];
      const numBatches = Math.ceil(data.inputs.length / batchSize);

      for (let i = 0; i < numBatches; i++) {
        const start = i * batchSize;
        const end = Math.min(start + batchSize, data.inputs.length);

        batches.push({
          inputs: data.inputs.slice(start, end),
          targets: data.targets.slice(start, end)
        });
      }

      Logger.debug(`Created ${batches.length} batches of size ${batchSize}`);
      return batches;
    } catch (error) {
      Logger.error('Failed to create batches:', error);
      throw error;
    }
  }

  shuffleBatches(batches: TrainingData[]): TrainingData[] {
    return [...batches].sort(() => Math.random() - 0.5);
  }
}