import { describe, it } from 'node:test';
import assert from 'node:assert';
import { Matrix } from '../matrix.js';

describe('Matrix', () => {
  it('should create a matrix with correct dimensions', () => {
    const matrix = new Matrix(2, 3);
    assert.strictEqual(matrix.rows, 2);
    assert.strictEqual(matrix.cols, 3);
  });

  it('should create a random matrix within bounds', () => {
    const matrix = Matrix.random(2, 2, -1, 1);
    for (let i = 0; i < matrix.rows; i++) {
      for (let j = 0; j < matrix.cols; j++) {
        assert(matrix.data[i][j] >= -1 && matrix.data[i][j] <= 1);
      }
    }
  });

  it('should multiply matrices correctly', () => {
    const m1 = new Matrix(2, 3);
    const m2 = new Matrix(3, 2);
    m1.data = [[1, 2, 3], [4, 5, 6]];
    m2.data = [[7, 8], [9, 10], [11, 12]];
    
    const result = m1.multiply(m2);
    assert.deepStrictEqual(result.data, [[58, 64], [139, 154]]);
  });

  it('should add matrices correctly', () => {
    const m1 = new Matrix(2, 2);
    const m2 = new Matrix(2, 2);
    m1.data = [[1, 2], [3, 4]];
    m2.data = [[5, 6], [7, 8]];
    
    const result = m1.add(m2);
    assert.deepStrictEqual(result.data, [[6, 8], [10, 12]]);
  });
});