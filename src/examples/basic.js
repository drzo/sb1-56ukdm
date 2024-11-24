import { Matrix } from '../matrix.js';
import { IntegratedSystem } from '../integration/index.js';

const system = new IntegratedSystem(32);

// Example input
const input = new Matrix(1, 2);
input.data = [[0.5, -0.3]];

// Process input
console.log('Processing input:', input.data);
const state = system.process(input, 'example1');
console.log('Reservoir state:', state.data);

// Recall state
const recalled = system.recall('example1');
console.log('Recalled state:', recalled.data);