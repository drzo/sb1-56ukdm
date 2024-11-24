import { describe, it } from 'node:test';
import assert from 'node:assert';
import { IntegratedSystem } from '../integration/index.js';
import { Matrix } from '../matrix.js';

describe('IntegratedSystem', () => {
  it('should process and store states', () => {
    const system = new IntegratedSystem(5);
    const input = new Matrix(1, 2);
    input.data = [[0.1, 0.2]];
    
    const state = system.process(input, 'test1');
    assert.strictEqual(state.rows, 1);
    assert.strictEqual(state.cols, 5);
    
    const recalled = system.recall('test1');
    assert.deepStrictEqual(recalled.data, state.data);
  });

  it('should handle reset correctly', () => {
    const system = new IntegratedSystem(5);
    const input = new Matrix(1, 2);
    input.data = [[0.1, 0.2]];
    
    system.process(input, 'test2');
    system.reset();
    
    const state = system.reservoir.getState();
    assert.deepStrictEqual(state.data, [[0, 0, 0, 0, 0]]);
  });
});