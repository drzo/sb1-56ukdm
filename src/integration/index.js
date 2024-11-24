import { Reservoir } from '../reservoir/index.js';
import { MemorySystem } from '../memory/index.js';

export class IntegratedSystem {
  constructor(reservoirSize = 100) {
    this.reservoir = new Reservoir(reservoirSize);
    this.memory = new MemorySystem();
  }

  process(input, key) {
    const state = this.reservoir.forward(input);
    this.memory.store(key, state);
    return state;
  }

  recall(key) {
    return this.memory.retrieve(key);
  }

  reset() {
    this.reservoir.reset();
  }
}