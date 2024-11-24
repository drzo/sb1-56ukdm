import { Matrix, multiply, random, tanh } from 'mathjs';
import { AtomSpace, Node as AtomNode } from '@opencog/atomspace';

export class ReservoirNode {
  private units: number;
  private inputScaling: number;
  private spectralRadius: number;
  private atomspace: AtomSpace;
  
  private Win?: Matrix;  // Input weights
  private W?: Matrix;    // Reservoir weights
  private state?: Matrix; // Current state

  constructor(
    units: number = 100,
    inputScaling: number = 1.0,
    spectralRadius: number = 0.99,
    atomspace?: AtomSpace
  ) {
    this.units = units;
    this.inputScaling = inputScaling;
    this.spectralRadius = spectralRadius;
    this.atomspace = atomspace || new AtomSpace();
  }

  private initialize(inputDim: number): void {
    // Initialize input weights
    this.Win = multiply(
      random([this.units, inputDim], -1, 1),
      this.inputScaling
    ) as Matrix;

    // Initialize reservoir weights with spectral radius scaling
    const W = random([this.units, this.units], -1, 1) as Matrix;
    const eigenvalues = W.eigs().values;
    const maxEigenvalue = Math.max(...eigenvalues.map(Math.abs));
    this.W = multiply(W, this.spectralRadius / maxEigenvalue) as Matrix;

    // Initialize state
    this.state = random([1, this.units], 0, 0) as Matrix;
  }

  forward(input: Matrix): Matrix {
    if (!this.W || !this.Win || !this.state) {
      this.initialize(input.size()[1]);
    }

    // Update reservoir state
    const inputProjection = multiply(input, this.Win!.transpose());
    const recurrentProjection = multiply(this.state!, this.W!);
    this.state = tanh(add(inputProjection, recurrentProjection)) as Matrix;

    return this.state;
  }

  toAtoms(): Map<string, AtomNode> {
    const atoms = new Map<string, AtomNode>();

    if (this.state) {
      // Convert state to NumberNode atoms
      const stateValues = this.state.valueOf() as number[][];
      stateValues.forEach((row, i) => {
        row.forEach((value, j) => {
          const atom = this.atomspace.addNode(
            'NumberNode',
            `state_${i}_${j}`,
            value
          );
          atoms.set(`state_${i}_${j}`, atom);
        });
      });
    }

    return atoms;
  }

  getState(): Matrix | undefined {
    return this.state;
  }

  reset(): void {
    if (this.state) {
      this.state = random([1, this.units], 0, 0) as Matrix;
    }
  }
}