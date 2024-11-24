import { Matrix, matrix } from 'mathjs';
import { AtomSpace, Node as AtomNode } from '@opencog/atomspace';

export class AtomConverter {
  private atomspace: AtomSpace;

  constructor(atomspace: AtomSpace) {
    this.atomspace = atomspace;
  }

  matrixToAtoms(mat: Matrix, prefix: string = 'value'): AtomNode[] {
    const atoms: AtomNode[] = [];
    const values = mat.valueOf() as number[][];

    values.forEach((row, i) => {
      row.forEach((value, j) => {
        const atom = this.atomspace.addNode(
          'NumberNode',
          `${prefix}_${i}_${j}`,
          value
        );
        atoms.push(atom);
      });
    });

    return atoms;
  }

  atomsToMatrix(atoms: AtomNode[], shape: [number, number]): Matrix {
    const [rows, cols] = shape;
    const values: number[][] = Array(rows).fill(0).map(() => Array(cols).fill(0));

    atoms.forEach(atom => {
      const [_, i, j] = atom.name.split('_').map(Number);
      values[i][j] = atom.value;
    });

    return matrix(values);
  }
}