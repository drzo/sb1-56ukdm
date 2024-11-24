export class Matrix {
  constructor(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    this.data = new Array(rows).fill(0).map(() => new Array(cols).fill(0));
  }

  static random(rows, cols, min = -1, max = 1) {
    const matrix = new Matrix(rows, cols);
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        matrix.data[i][j] = min + Math.random() * (max - min);
      }
    }
    return matrix;
  }

  multiply(other) {
    if (this.cols !== other.rows) {
      throw new Error('Invalid matrix dimensions for multiplication');
    }

    const result = new Matrix(this.rows, other.cols);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < other.cols; j++) {
        let sum = 0;
        for (let k = 0; k < this.cols; k++) {
          sum += this.data[i][k] * other.data[k][j];
        }
        result.data[i][j] = sum;
      }
    }
    return result;
  }

  add(other) {
    if (this.rows !== other.rows || this.cols !== other.cols) {
      throw new Error('Invalid matrix dimensions for addition');
    }

    const result = new Matrix(this.rows, this.cols);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        result.data[i][j] = this.data[i][j] + other.data[i][j];
      }
    }
    return result;
  }

  transpose() {
    const result = new Matrix(this.cols, this.rows);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        result.data[j][i] = this.data[i][j];
      }
    }
    return result;
  }
}