import { describe, it, expect, beforeEach } from 'vitest';
import { MultiReservoirManager } from '../../reservoir/core/MultiReservoirManager';
import { ESNEnsembleService } from '../../reservoir/services/ESNEnsembleService';
import { ESNConfig } from '../../reservoir/types/ESNTypes';

describe('ESN Ensemble', () => {
  let manager: MultiReservoirManager;
  let service: ESNEnsembleService;
  let baseConfig: ESNConfig;

  beforeEach(() => {
    manager = MultiReservoirManager.getInstance();
    service = ESNEnsembleService.getInstance();
    baseConfig = {
      inputSize: 3,
      reservoirSize: 10,
      spectralRadius: 0.9,
      inputScaling: 0.1,
      leakingRate: 0.3,
      sparsity: 0.1
    };
  });

  it('should create and manage multiple reservoirs', () => {
    manager.addReservoir('r1', baseConfig);
    manager.addReservoir('r2', baseConfig);
    
    expect(manager.getReservoirIds()).toHaveLength(2);
    expect(manager.getEnsembleWeights().size).toBe(2);
  });

  it('should process ensemble input', async () => {
    manager.addReservoir('r1', baseConfig);
    manager.addReservoir('r2', baseConfig);

    const input = new Float32Array([1, 2, 3]);
    const output = await manager.processEnsemble(input);

    expect(output).toBeDefined();
    expect(output.length).toBe(10); // reservoirSize
  });

  it('should optimize ensemble weights', async () => {
    const validationData = [
      { input: new Float32Array([1, 2, 3]), target: new Float32Array([1]) },
      { input: new Float32Array([4, 5, 6]), target: new Float32Array([0]) }
    ];

    manager.addReservoir('r1', baseConfig);
    manager.addReservoir('r2', baseConfig);

    await manager.optimizeEnsemble(validationData);
    const weights = manager.getEnsembleWeights();

    expect(weights.size).toBe(2);
    expect(Array.from(weights.values()).reduce((a, b) => a + b)).toBeCloseTo(1);
  });

  it('should create optimal ensemble', async () => {
    const validationData = {
      inputs: [[1, 2, 3], [4, 5, 6]],
      targets: [[1], [0]]
    };

    const reservoirIds = await service.createOptimalEnsemble(
      baseConfig,
      validationData,
      2
    );

    expect(reservoirIds).toHaveLength(2);
    
    const metrics = await service.evaluateEnsemble(validationData);
    expect(metrics.accuracy).toBeGreaterThan(0);
    expect(metrics.stability).toBeGreaterThan(0);
  });
});