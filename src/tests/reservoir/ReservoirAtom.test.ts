import { describe, it, expect, beforeEach } from 'vitest';
import { ReservoirAtom } from '../../reservoir/ReservoirAtom';
import { TrainingData } from '../../reservoir/types/ESNTypes';

describe('ReservoirAtom', () => {
  let reservoir: ReservoirAtom;

  beforeEach(() => {
    reservoir = new ReservoirAtom('test-reservoir', {
      inputSize: 3,
      reservoirSize: 10
    });
  });

  it('should process input', async () => {
    const input = new Float32Array([1, 2, 3]);
    const output = await reservoir.process(input);
    expect(output).toBeDefined();
    expect(output.length).toBe(10);
  });

  it('should train and maintain history', async () => {
    const trainingData: TrainingData = {
      inputs: [
        [1, 2, 3],
        [4, 5, 6]
      ],
      targets: [
        [1, 0],
        [0, 1]
      ]
    };

    const metrics = await reservoir.train(trainingData);
    expect(metrics).toBeDefined();

    const history = reservoir.getTrainingHistory();
    expect(history).toHaveLength(1);
    expect(history[0]).toEqual(metrics);
  });

  it('should cleanup resources on dispose', () => {
    expect(() => reservoir.dispose()).not.toThrow();
    expect(reservoir.getTrainingHistory()).toHaveLength(0);
  });
});