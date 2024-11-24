import { describe, it, expect, beforeEach } from 'vitest';
import { ReservoirAtom } from '../../reservoir/ReservoirAtom';
import { ESNConfig } from '../../reservoir/types/ESNTypes';

describe('ReservoirPy Integration', () => {
  let reservoir: ReservoirAtom;
  let config: ESNConfig;

  beforeEach(() => {
    config = {
      inputSize: 3,
      reservoirSize: 100,
      spectralRadius: 0.9,
      inputScaling: 0.1,
      leakingRate: 0.3,
      sparsity: 0.1,
      feedback: true,
      fbScaling: 0.1,
      regressionMethod: 'ridge',
      solverArgs: {
        alpha: 1e-6,
        max_iter: 100,
        tol: 1e-4
      },
      washoutLength: 100
    };
    reservoir = new ReservoirAtom('test-reservoir');
  });

  it('should initialize with feedback connections', async () => {
    await reservoir.initialize(config);
    const state = reservoir.getState();
    expect(state.weights.feedback).toBeDefined();
  });

  it('should respect washout length during training', async () => {
    await reservoir.initialize(config);
    const data = {
      inputs: Array(200).fill([1, 2, 3]),
      targets: Array(200).fill([1]),
      washoutLength: 100
    };
    const metrics = await reservoir.train(data);
    expect(metrics.accuracy).toBeGreaterThan(0);
  });

  it('should use specified regression method', async () => {
    config.regressionMethod = 'lasso';
    await reservoir.initialize(config);
    const data = {
      inputs: Array(100).fill([1, 2, 3]),
      targets: Array(100).fill([1])
    };
    const metrics = await reservoir.train(data);
    expect(metrics.accuracy).toBeGreaterThan(0);
  });

  it('should optimize feedback scaling', async () => {
    await reservoir.initialize(config);
    const initialFbScaling = config.fbScaling;
    await reservoir.optimize();
    const optimizedConfig = reservoir.getConfig();
    expect(optimizedConfig.fbScaling).not.toBe(initialFbScaling);
  });
});