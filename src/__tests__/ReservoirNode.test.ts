import { matrix } from 'mathjs';
import { AtomSpace } from '@opencog/atomspace';
import { ReservoirNode } from '../ReservoirNode';

describe('ReservoirNode', () => {
  let atomspace: AtomSpace;
  let reservoir: ReservoirNode;

  beforeEach(() => {
    atomspace = new AtomSpace();
    reservoir = new ReservoirNode(5, 0.5, 0.9, atomspace);
  });

  test('initialization', () => {
    expect(reservoir).toBeDefined();
  });

  test('forward pass', () => {
    const input = matrix([[1, 2, 3]]);
    const state = reservoir.forward(input);
    
    expect(state.size()).toEqual([1, 5]);
    
    // Second forward pass should produce different state
    const state2 = reservoir.forward(input);
    expect(state.valueOf()).not.toEqual(state2.valueOf());
  });

  test('atom conversion', () => {
    const input = matrix([[1, 2, 3]]);
    reservoir.forward(input);
    
    const atoms = reservoir.toAtoms();
    expect(atoms.size).toBeGreaterThan(0);
    
    // Check atoms are in atomspace
    for (const atom of atoms.values()) {
      expect(atomspace.containsAtom(atom)).toBe(true);
    }
  });

  test('reset', () => {
    const input = matrix([[1, 2, 3]]);
    const state1 = reservoir.forward(input);
    
    reservoir.reset();
    const state2 = reservoir.forward(input);
    
    expect(state1.valueOf()).not.toEqual(state2.valueOf());
  });
});