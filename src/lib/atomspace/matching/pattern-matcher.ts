import { Atom, Pattern, BindingMap, QueryResult } from '../types/atom';

export class PatternMatcher {
  constructor(private atomSpace: Map<string, Atom>) {}

  match(
    atom: Atom,
    pattern: Pattern,
    bindings: BindingMap = {},
    context: MatchContext = { depth: 0, visited: new Set() }
  ): QueryResult | null {
    // Handle recursion
    if (pattern.recursive) {
      return this.handleRecursion(atom, pattern, bindings, context);
    }

    // Handle variable patterns
    if (pattern.isVariable) {
      return this.handleVariable(atom, pattern, bindings, context);
    }

    // Match type and name if specified
    if (pattern.type && pattern.type !== atom.type) return null;
    if (pattern.name && pattern.name !== atom.name) return null;

    // Handle logical operators
    if (pattern.operator && pattern.patterns) {
      return this.handleLogicalOperator(atom, pattern, bindings, context);
    }

    // Handle outgoing links
    if (pattern.outgoing && atom.outgoing) {
      return this.handleOutgoingLinks(atom, pattern, bindings, context);
    }

    // Basic match
    return {
      atoms: [atom],
      bindings,
      depth: context.depth
    };
  }

  private handleRecursion(
    atom: Atom,
    pattern: Pattern,
    bindings: BindingMap,
    context: MatchContext
  ): QueryResult | null {
    // Check recursion depth
    if (pattern.recursive?.maxDepth !== undefined && 
        context.depth > pattern.recursive.maxDepth) {
      return null;
    }

    // Detect cycles if enabled
    if (pattern.recursive?.detectCycles && context.visited.has(atom.id)) {
      return null;
    }

    // Match current atom
    const currentMatch = this.match(
      atom,
      { ...pattern, recursive: undefined },
      bindings,
      context
    );

    if (!currentMatch) return null;

    // Follow outgoing links if enabled
    if (pattern.recursive?.followLinks && atom.outgoing) {
      return this.handleRecursiveLinks(atom, pattern, currentMatch, context);
    }

    return currentMatch;
  }

  private handleVariable(
    atom: Atom,
    pattern: Pattern,
    bindings: BindingMap,
    context: MatchContext
  ): QueryResult | null {
    if (!pattern.variableName) return null;

    const existingBinding = bindings[pattern.variableName];
    if (existingBinding) {
      return existingBinding.id === atom.id
        ? { atoms: [atom], bindings, depth: context.depth }
        : null;
    }

    bindings[pattern.variableName] = atom;
    return { atoms: [atom], bindings, depth: context.depth };
  }

  private handleLogicalOperator(
    atom: Atom,
    pattern: Pattern,
    bindings: BindingMap,
    context: MatchContext
  ): QueryResult | null {
    if (!pattern.patterns) return null;

    switch (pattern.operator) {
      case 'AND':
        return this.handleAndOperator(atom, pattern.patterns, bindings, context);
      case 'OR':
        return this.handleOrOperator(atom, pattern.patterns, bindings, context);
      case 'NOT':
        return this.handleNotOperator(atom, pattern.patterns[0], bindings, context);
      default:
        return null;
    }
  }

  private handleAndOperator(
    atom: Atom,
    patterns: Pattern[],
    bindings: BindingMap,
    context: MatchContext
  ): QueryResult | null {
    const results = patterns.map(p => 
      this.match(atom, p, { ...bindings }, {
        ...context,
        depth: context.depth + 1,
        visited: new Set([...context.visited, atom.id])
      })
    );

    if (results.some(r => !r)) return null;

    const allMatches = results.flatMap(r => r!.atoms);
    const mergedBindings = results.reduce((acc, r) => ({ ...acc, ...r!.bindings }), {});

    return {
      atoms: allMatches,
      bindings: mergedBindings,
      depth: context.depth
    };
  }

  private handleOrOperator(
    atom: Atom,
    patterns: Pattern[],
    bindings: BindingMap,
    context: MatchContext
  ): QueryResult | null {
    for (const p of patterns) {
      const result = this.match(atom, p, { ...bindings }, {
        ...context,
        depth: context.depth + 1,
        visited: new Set([...context.visited, atom.id])
      });
      if (result) return result;
    }
    return null;
  }

  private handleNotOperator(
    atom: Atom,
    pattern: Pattern,
    bindings: BindingMap,
    context: MatchContext
  ): QueryResult | null {
    const result = this.match(atom, pattern, { ...bindings }, {
      ...context,
      depth: context.depth + 1,
      visited: new Set([...context.visited, atom.id])
    });
    return result ? null : { atoms: [atom], bindings, depth: context.depth };
  }

  private handleOutgoingLinks(
    atom: Atom,
    pattern: Pattern,
    bindings: BindingMap,
    context: MatchContext
  ): QueryResult | null {
    if (!pattern.outgoing || !atom.outgoing) return null;
    if (pattern.outgoing.length !== atom.outgoing.length) return null;

    const outgoingResults = pattern.outgoing.map((p, i) => {
      const targetAtom = this.atomSpace.get(atom.outgoing![i]);
      if (!targetAtom) return null;

      return typeof p === 'string'
        ? p === targetAtom.id
          ? { atoms: [targetAtom], bindings, depth: context.depth + 1 }
          : null
        : this.match(targetAtom, p, { ...bindings }, {
            ...context,
            depth: context.depth + 1,
            visited: new Set([...context.visited, atom.id])
          });
    });

    if (outgoingResults.some(r => !r)) return null;

    const allMatches = [atom, ...outgoingResults.flatMap(r => r!.atoms)];
    const mergedBindings = outgoingResults.reduce(
      (acc, r) => ({ ...acc, ...r!.bindings }),
      bindings
    );

    return {
      atoms: allMatches,
      bindings: mergedBindings,
      depth: context.depth
    };
  }

  private handleRecursiveLinks(
    atom: Atom,
    pattern: Pattern,
    currentMatch: QueryResult,
    context: MatchContext
  ): QueryResult | null {
    const recursiveResults: QueryResult[] = [];

    for (const targetId of atom.outgoing!) {
      const targetAtom = this.atomSpace.get(targetId);
      if (!targetAtom) continue;

      const result = this.match(
        targetAtom,
        pattern,
        { ...currentMatch.bindings },
        {
          ...context,
          depth: context.depth + 1,
          visited: new Set([...context.visited, atom.id])
        }
      );

      if (result) recursiveResults.push(result);
    }

    if (recursiveResults.length === 0) return currentMatch;

    const allMatches = [
      atom,
      ...recursiveResults.flatMap(r => r.atoms)
    ];

    const mergedBindings = recursiveResults.reduce(
      (acc, r) => ({ ...acc, ...r.bindings }),
      currentMatch.bindings
    );

    return {
      atoms: allMatches,
      bindings: mergedBindings,
      depth: context.depth
    };
  }
}

interface MatchContext {
  depth: number;
  visited: Set<string>;
}</content></file>

<boltAction type="file" filePath="src/lib/atomspace/store.ts">import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Atom, AtomType, Pattern, QueryResult } from '../types/atom';
import { PatternMatcher } from './matching/pattern-matcher';

interface AtomSpaceState {
  atoms: Map<string, Atom>;
  addAtom: (atom: Atom) => void;
  removeAtom: (id: string) => void;
  getAtom: (id: string) => Atom | undefined;
  getAtomsByType: (type: AtomType) => Atom[];
  findPatterns: (pattern: Pattern) => QueryResult[];
}

export const useAtomSpace = create<AtomSpaceState>((set, get) => {
  const matcher = new PatternMatcher(get().atoms);

  return {
    atoms: new Map<string, Atom>(),
    
    addAtom: (atom: Atom) => {
      const atoms = new Map(get().atoms);
      atom.id = atom.id || uuidv4();
      atoms.set(atom.id, atom);
      set({ atoms });
    },
    
    removeAtom: (id: string) => {
      const atoms = new Map(get().atoms);
      atoms.delete(id);
      set({ atoms });
    },
    
    getAtom: (id: string) => {
      return get().atoms.get(id);
    },
    
    getAtomsByType: (type: AtomType) => {
      return Array.from(get().atoms.values()).filter(atom => atom.type === type);
    },

    findPatterns: (pattern: Pattern): QueryResult[] => {
      const results: QueryResult[] = [];
      const atoms = Array.from(get().atoms.values());

      atoms.forEach(atom => {
        const result = matcher.match(atom, pattern);
        if (result) results.push(result);
      });

      return results;
    }
  };
});</content></file>

<boltAction type="file" filePath="src/lib/atomspace/validation/pattern-validator.ts">import { Pattern, AtomType } from '../types/atom';

export class PatternValidator {
  private static readonly VALID_TYPES: AtomType[] = [
    'ConceptNode',
    'PredicateNode',
    'ListLink',
    'EvaluationLink',
    'VariableNode'
  ];

  static validatePattern(pattern: Pattern): boolean {
    // Basic pattern validation
    if (!pattern) return false;

    // Variable pattern validation
    if (pattern.isVariable) {
      if (!pattern.variableName) return false;
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(pattern.variableName)) return false;
    }

    // Operator pattern validation
    if (pattern.operator) {
      if (!pattern.patterns || !Array.isArray(pattern.patterns)) return false;
      if (pattern.patterns.length === 0) return false;
      if (pattern.operator === 'NOT' && pattern.patterns.length !== 1) return false;
      return pattern.patterns.every(p => this.validatePattern(p));
    }

    // Outgoing links validation
    if (pattern.outgoing) {
      if (!Array.isArray(pattern.outgoing)) return false;
      return pattern.outgoing.every(link => 
        typeof link === 'string' || this.validatePattern(link)
      );
    }

    // Type validation
    if (pattern.type) {
      if (!this.VALID_TYPES.includes(pattern.type)) return false;
    }

    // Recursive options validation
    if (pattern.recursive) {
      if (typeof pattern.recursive.maxDepth === 'number') {
        if (pattern.recursive.maxDepth < 0) return false;
      }
      if (typeof pattern.recursive.detectCycles !== 'boolean' &&
          pattern.recursive.detectCycles !== undefined) return false;
    }

    return true;
  }
}</content></file>

<boltAction type="start">
<command>npm run dev</command>