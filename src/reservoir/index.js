import { Matrix } from '../matrix.js';

export class Reservoir {
  constructor(size = 100, inputScaling = 0.5, spectralRadius = 0.9) {
    this.size = size;
    this.inputScaling = inputScaling;
    this.spectralRadius = spectralRadius;
    this.state = new Matrix(1, size);
    this.initialized = false;
  }

  initialize(inputDim) {
    this.Win = Matrix.random(this.size, inputDim, -this.inputScaling, this.inputScaling);
    this.W = Matrix.random(this.size, this.size, -1, 1);
    
    for (let i = 0; i < this.W.rows; i++) {
      for (let j = 0; j < this.W.cols; j++) {
        this.W.data[i][j] *= this.spectralRadius / this.size;
      }
    }

    this.initialized = true;
  }

  forward(input) {
    if (!this.initialized) {
      this.initialize(input.cols);
    }

    const inputProjection = input.multiply(this.Win.transpose());
    const recurrentProjection = this.state.multiply(this.W);
    const combined = inputProjection.add(recurrentProjection);
    
    this.state = new Matrix(1, this.size);
    for (let i = 0; i < this.size; i++) {
      this.state.data[0][i] = Math.tanh(combined.data[0][i]);
    }

    return this.state;
  }

  getState() {
    return this.state;
  }

  reset() {
    this.state = new Matrix(1, this.size);
  }
}