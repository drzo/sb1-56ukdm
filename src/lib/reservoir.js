import { Matrix } from './matrix';

export class Reservoir {
  constructor(size = 32, inputScaling = 0.5, spectralRadius = 0.9) {
    this.size = size;
    this.inputScaling = inputScaling;
    this.spectralRadius = spectralRadius;
    this.state = new Float32Array(size);
    this.weights = this.initializeWeights();
  }

  initializeWeights() {
    const weights = new Float32Array(this.size * this.size);
    for (let i = 0; i < weights.length; i++) {
      weights[i] = (Math.random() * 2 - 1) * this.spectralRadius;
    }
    return weights;
  }

  process(input) {
    const newState = new Float32Array(this.size);
    
    for (let i = 0; i < this.size; i++) {
      let sum = input * this.inputScaling;
      for (let j = 0; j < this.size; j++) {
        sum += this.state[j] * this.weights[i * this.size + j];
      }
      newState[i] = Math.tanh(sum);
    }
    
    this.state = newState;
    return Array.from(this.state);
  }

  reset() {
    this.state = new Float32Array(this.size);
  }
}

const reservoir = new Reservoir();

export function processInput(input) {
  return reservoir.process(input);
}