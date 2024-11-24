import { Atom, BindingMap } from '../../types';
import { TypeValidator } from '../../types/type-validation';
import { TypeInferenceContext } from '../../types/type-inference-context';

export class MatchContext {
  private visited: Set<string> = new Set();
  private depth: number = 0;
  private recursiveDepth: number = 0;
  private bindings: BindingMap = {};
  private typeContext: TypeInferenceContext;
  private typeValidator: TypeValidator;

  constructor(
    private atomSpace: Map<string, Atom>,
    private typeHierarchy: TypeHierarchy
  ) {
    this.typeContext = new TypeInferenceContext(typeHierarchy);
    this.typeValidator = new TypeValidator(typeHierarchy);
  }

  visitAtom(atomId: string): void {
    this.visited.add(atomId);
  }

  unvisitAtom(atomId: string): void {
    this.visited.delete(atomId);
  }

  isAtomVisited(atomId: string): boolean {
    return this.visited.has(atomId);
  }

  incrementDepth(): void {
    this.depth++;
  }

  decrementDepth(): void {
    this.depth--;
  }

  getDepth(): number {
    return this.depth;
  }

  incrementRecursiveDepth(): void {
    this.recursiveDepth++;
  }

  getRecursiveDepth(): number {
    return this.recursiveDepth;
  }

  addBinding(variableName: string, atom: Atom): void {
    this.bindings[variableName] = atom;
  }

  getBinding(variableName: string): Atom | undefined {
    return this.bindings[variableName];
  }

  getAllBindings(): BindingMap {
    return { ...this.bindings };
  }

  getAtom(id: string): Atom | undefined {
    return this.atomSpace.get(id);
  }

  getTypeContext(): TypeInferenceContext {
    return this.typeContext;
  }

  getTypeValidator(): TypeValidator {
    return this.typeValidator;
  }

  clone(): MatchContext {
    const cloned = new MatchContext(this.atomSpace, this.typeHierarchy);
    cloned.visited = new Set(this.visited);
    cloned.depth = this.depth;
    cloned.recursiveDepth = this.recursiveDepth;
    cloned.bindings = { ...this.bindings };
    cloned.typeContext = this.typeContext.clone();
    return cloned;
  }
}