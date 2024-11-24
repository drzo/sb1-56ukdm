import { TrainingData } from '../types/ESNTypes';
import { Logger } from '../../cogutil/Logger';

export class ESNDataGenerator {
  private static instance: ESNDataGenerator;

  private constructor() {}

  public static getInstance(): ESNDataGenerator {
    if (!ESNDataGenerator.instance) {
      ESNDataGenerator.instance = new ESNDataGenerator();
    }
    return ESNDataGenerator.instance;
  }

  generateTimeSeriesData(
    inputSize: number,
    sequenceLength: number,
    noise: number = 0.01
  ): TrainingData {
    try {
      const inputs: number[][] = [];
      const targets: number[][] = [];

      // Generate AR(2) process
      const series = [];
      series[0] = Math.random();
      series[1] = Math.random();

      for (let i = 2; i < sequenceLength + inputSize; i++) {
        series[i] = 0.6 * series[i-1] - 0.2 * series[i-2] + 
                   (Math.random() * 2 - 1) * noise;
      }

      // Create input-target pairs
      for (let i = 0; i < sequenceLength; i++) {
        inputs.push(series.slice(i, i + inputSize));
        targets.push([series[i + inputSize]]);
      }

      Logger.debug(`Generated time series data: ${sequenceLength} sequences`);
      return { inputs, targets };
    } catch (error) {
      Logger.error('Failed to generate time series data:', error);
      throw error;
    }
  }

  generateSineWaveData(
    inputSize: number,
    sequenceLength: number,
    frequency: number = 0.1,
    noise: number = 0.01
  ): TrainingData {
    try {
      const inputs: number[][] = [];
      const targets: number[][] = [];

      for (let i = 0; i < sequenceLength; i++) {
        const t = i * frequency;
        const input = Array.from(
          { length: inputSize },
          () => Math.sin(t) + (Math.random() * 2 - 1) * noise
        );
        const target = [Math.sin(t + frequency)];
        inputs.push(input);
        targets.push(target);
      }

      Logger.debug(`Generated sine wave data: ${sequenceLength} sequences`);
      return { inputs, targets };
    } catch (error) {
      Logger.error('Failed to generate sine wave data:', error);
      throw error;
    }
  }

  generateClassificationData(
    inputSize: number,
    sequenceLength: number,
    numClasses: number,
    noise: number = 0.1
  ): TrainingData {
    try {
      const inputs: number[][] = [];
      const targets: number[][] = [];

      for (let i = 0; i < sequenceLength; i++) {
        // Generate class-specific pattern
        const classIndex = Math.floor(Math.random() * numClasses);
        const basePattern = Array.from(
          { length: inputSize },
          () => Math.sin(2 * Math.PI * classIndex / numClasses)
        );

        // Add noise
        const input = basePattern.map(x => 
          x + (Math.random() * 2 - 1) * noise
        );

        // Create one-hot encoded target
        const target = Array(numClasses).fill(0);
        target[classIndex] = 1;

        inputs.push(input);
        targets.push(target);
      }

      Logger.debug(`Generated classification data: ${sequenceLength} sequences`);
      return { inputs, targets };
    } catch (error) {
      Logger.error('Failed to generate classification data:', error);
      throw error;
    }
  }

  generateChaosData(
    inputSize: number,
    sequenceLength: number,
    noise: number = 0.01
  ): TrainingData {
    try {
      const inputs: number[][] = [];
      const targets: number[][] = [];

      // Generate Lorenz attractor
      let x = Math.random();
      let y = Math.random();
      let z = Math.random();
      const dt = 0.01;
      const sigma = 10;
      const rho = 28;
      const beta = 8/3;

      const series = [];
      for (let i = 0; i < sequenceLength + inputSize; i++) {
        const dx = sigma * (y - x) * dt;
        const dy = (x * (rho - z) - y) * dt;
        const dz = (x * y - beta * z) * dt;

        x += dx;
        y += dy;
        z += dz;

        series.push(x + (Math.random() * 2 - 1) * noise);
      }

      // Create input-target pairs
      for (let i = 0; i < sequenceLength; i++) {
        inputs.push(series.slice(i, i + inputSize));
        targets.push([series[i + inputSize]]);
      }

      Logger.debug(`Generated chaos data: ${sequenceLength} sequences`);
      return { inputs, targets };
    } catch (error) {
      Logger.error('Failed to generate chaos data:', error);
      throw error;
    }
  }
}