export type Matrix = number[][];

export function multiply(a: Matrix, b: Matrix): Matrix {
  const result: Matrix = [];
  for (let i = 0; i < a.length; i++) {
    result[i] = [];
    for (let j = 0; j < b[0].length; j++) {
      let sum = 0;
      for (let k = 0; k < b.length; k++) {
        sum += a[i][k] * b[k][j];
      }
      result[i][j] = sum;
    }
  }
  return result;
}

export function add(a: Matrix, b: Matrix): Matrix {
  return a.map((row, i) => row.map((val, j) => val + b[i][j]));
}

export function transpose(matrix: Matrix): Matrix {
  return matrix[0].map((_, i) => matrix.map(row => row[i]));
}

export function random(rows: number, cols: number, min: number, max: number): Matrix {
  return Array(rows).fill(0).map(() => 
    Array(cols).fill(0).map(() => min + Math.random() * (max - min))
  );
}