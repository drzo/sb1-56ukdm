import { describe, it, expect, beforeEach } from 'vitest';
import { ESNCore } from '../../reservoir/core/ESNCore';
import { TrainingData } from '../../reservoir/types/ESNTypes';

describe('ESNCore', () => {
  let esn: ESNCore;

  beforeEach(() => {
    esn = new ESNCore({
      inputSize: 3,
      reservoirSize: 10,
      spectralRadius: 0.9
    });
  });

  it('should process input correctly', async () => {
    const input = new Float32Array([1, 2, 3]);
    const output = await esn.update(input);
    expect(output).toBeDefined();
    expect(output.length).toBe(10); // reservoirSize
  });

  it('should train on data', async () => {
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

    const metrics = await esn.train(trainingData);
    expect(metrics.accuracy).toBeGreaterThan(0);
    expect(metrics.complexity).toBeGreaterThan(0);
    expect(metrics.stability).toBeGreaterThan(0);
  });

  it('should maintain state between updates', async () => {
    const input1 = new Float32Array([1, 2, 3]);
    const input2 = new Float32Array([4, 5, 6]);
    
    const output1 = await esn.update(input1);
    const state1 = esn.getState();
    
    const output2 = await esn.update(input2);
    const state2 = esn.getState();

    expect(output1).not.toEqual(output2);
    expect(state1.timestamp).toBeLessThan(state2.timestamp);
  });
});