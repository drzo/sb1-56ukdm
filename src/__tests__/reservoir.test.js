import { describe, it } from 'node:test';
import assert from 'node:assert';
import { Reservoir } from '../reservoir.js';
import { Matrix } from '../matrix.js';

describe('Reservoir', () => {
  it('should initialize with correct parameters', () => {
    const reservoir = new Reservoir(10, 0.5, 0.9);
    assert.strictEqual(reservoir.size, 10);
    assert.strictEqual(reservoir.inputScaling, 0.5);
    assert.strictEqual(reservoir.spectralRadius, 0.9);
  });

  it('should process input correctly', () => {
    const reservoir = new Reservoir(5);
    const input = new Matrix(1, 2);
    input.data = [[0.1, 0.2]];
    
    const state = reservoir.forward(input);
    assert.strictEqual(state.rows, 1);
    assert.strictEqual(state.cols, 5);
  });

  it('should maintain state between calls', () => {
    const reservoir = new Reservoir(5);
    const input = new Matrix(1, 2);
    input.data = [[0.1, 0.2]];
    
    const state1 = reservoir.forward(input);
    const state2 = reservoir.forward(input);
    assert.notDeepStrictEqual(state1.data, state2.data);
  });

  it('should reset state correctly', () => {
    const reservoir = new Reservoir(5);
    const input = new Matrix(1, 2);
    input.data = [[0.1, 0.2]];
    
    reservoir.forward(input);
    reservoir.reset();
    assert.deepStrictEqual(reservoir.state.data, [[0, 0, 0, 0, 0]]);
  });
});