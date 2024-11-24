export class SimpleReservoir {
  constructor(size = 32) {
    this.size = size;
    this.state = new Float32Array(size);
    this.weights = this.initializeWeights();
  }

  initializeWeights() {
    const weights = new Float32Array(this.size * this.size);
    for (let i = 0; i < weights.length; i++) {
      weights[i] = (Math.random() * 2 - 1) * 0.9;
    }
    return weights;
  }

  process(input) {
    const newState = new Float32Array(this.size);
    
    for (let i = 0; i < this.size; i++) {
      let sum = input;
      for (let j = 0; j < this.size; j++) {
        sum += this.state[j] * this.weights[i * this.size + j];
      }
      newState[i] = Math.tanh(sum);
    }
    
    this.state = newState;
    return this.state;
  }

  getState() {
    return this.state;
  }

  reset() {
    this.state = new Float32Array(this.size);
  }
}