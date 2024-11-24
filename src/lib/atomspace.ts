import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Atom, AtomSpaceState, AtomType, Pattern, BindingMap, QueryResult, TruthValue, RecursiveOptions, PatternTemplate } from './types';
import { calculateRevision, calculateDeduction, calculateIntersection, calculateUnion } from './truthValueOperations';

interface MatchContext {
  visited: Set<string>;
  depth: number;
  atomSpace: Map<string, Atom>;
}

interface MatchResult {
  matched: boolean;
  matchedAtoms: Atom[];
  bindings: BindingMap;
  depth: number;
}

function matchPattern(
  atom: Atom,
  pattern: Pattern,
  bindings: BindingMap,
  context: MatchContext
): MatchResult | null {
  // Check recursion depth
  if (pattern.recursive?.maxDepth !== undefined && context.depth > pattern.recursive.maxDepth) {
    return null;
  }

  // Detect cycles if enabled
  if (pattern.recursive?.detectCycles && context.visited.has(atom.id)) {
    return null;
  }

  // Handle variable patterns
  if (pattern.isVariable) {
    if (!pattern.variableName) return null;
    
    const existingBinding = bindings[pattern.variableName];
    if (existingBinding) {
      return existingBinding.id === atom.id
        ? { matched: true, matchedAtoms: [atom], bindings, depth: context.depth }
        : null;
    }
    
    bindings[pattern.variableName] = atom;
    return { matched: true, matchedAtoms: [atom], bindings, depth: context.depth };
  }

  // Match type and name if specified
  if (pattern.type && pattern.type !== atom.type) return null;
  if (pattern.name && pattern.name !== atom.name) return null;

  // Handle logical operators
  if (pattern.operator) {
    if (!pattern.patterns) return null;

    switch (pattern.operator) {
      case 'AND': {
        const results = pattern.patterns.map(p => 
          matchPattern(atom, p, { ...bindings }, { 
            ...context, 
            depth: context.depth + 1,
            visited: new Set([...context.visited, atom.id])
          })
        );
        if (results.some(r => !r)) return null;
        
        const allMatches = results.flatMap(r => r!.matchedAtoms);
        const mergedBindings = results.reduce((acc, r) => ({ ...acc, ...r!.bindings }), {});
        return {
          matched: true,
          matchedAtoms: allMatches,
          bindings: mergedBindings,
          depth: context.depth
        };
      }
      
      case 'OR': {
        for (const p of pattern.patterns) {
          const result = matchPattern(atom, p, { ...bindings }, {
            ...context,
            depth: context.depth + 1,
            visited: new Set([...context.visited, atom.id])
          });
          if (result) return result;
        }
        return null;
      }
      
      case 'NOT': {
        const result = matchPattern(atom, pattern.patterns[0], { ...bindings }, {
          ...context,
          depth: context.depth + 1,
          visited: new Set([...context.visited, atom.id])
        });
        return result ? null : { 
          matched: true, 
          matchedAtoms: [atom], 
          bindings, 
          depth: context.depth 
        };
      }
    }
  }

  // Handle outgoing links if specified
  if (pattern.outgoing && atom.outgoing) {
    if (pattern.outgoing.length !== atom.outgoing.length) return null;

    const outgoingResults = pattern.outgoing.map((p, i) => {
      const targetAtom = context.atomSpace.get(atom.outgoing![i]);
      if (!targetAtom) return null;
      
      return typeof p === 'string'
        ? p === targetAtom.id
          ? { matched: true, matchedAtoms: [targetAtom], bindings, depth: context.depth + 1 }
          : null
        : matchPattern(targetAtom, p, { ...bindings }, {
            ...context,
            depth: context.depth + 1,
            visited: new Set([...context.visited, atom.id])
          });
    });

    if (outgoingResults.some(r => !r)) return null;

    const allMatches = [atom, ...outgoingResults.flatMap(r => r!.matchedAtoms)];
    const mergedBindings = outgoingResults.reduce(
      (acc, r) => ({ ...acc, ...r!.bindings }),
      bindings
    );

    return {
      matched: true,
      matchedAtoms: allMatches,
      bindings: mergedBindings,
      depth: context.depth
    };
  }

  return {
    matched: true,
    matchedAtoms: [atom],
    bindings,
    depth: context.depth
  };
}

function computeTruthValue(atoms: Atom[], operator: TruthValueOperator): TruthValue | undefined {
  if (atoms.length < 2) return atoms[0]?.truthValue;

  const [first, second, ...rest] = atoms
    .filter(a => a.truthValue)
    .map(a => a.truthValue!);

  if (!first || !second) return undefined;

  let result: TruthValue;
  switch (operator) {
    case 'REVISION':
      result = calculateRevision(first, second);
      break;
    case 'DEDUCTION':
      result = calculateDeduction(first, second);
      break;
    case 'INTERSECTION':
      result = calculateIntersection(first, second);
      break;
    case 'UNION':
      result = calculateUnion(first, second);
      break;
  }

  return rest.reduce((acc, tv) => {
    switch (operator) {
      case 'REVISION':
        return calculateRevision(acc, tv);
      case 'DEDUCTION':
        return calculateDeduction(acc, tv);
      case 'INTERSECTION':
        return calculateIntersection(acc, tv);
      case 'UNION':
        return calculateUnion(acc, tv);
    }
  }, result);
}

export const useAtomSpace = create<AtomSpaceState>((set, get) => ({
  atoms: new Map<string, Atom>(),
  templates: new Map<string, PatternTemplate>(),
  
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
    const atoms = get().atoms;
    const results: QueryResult[] = [];
    
    Array.from(atoms.values()).forEach(atom => {
      const match = matchPattern(atom, pattern, {}, {
        visited: new Set<string>(),
        depth: 0,
        atomSpace: atoms
      });

      if (match) {
        const computedTruthValue = pattern.tvOperator 
          ? computeTruthValue(match.matchedAtoms, pattern.tvOperator)
          : undefined;

        results.push({
          atoms: match.matchedAtoms,
          bindings: match.bindings,
          computedTruthValue,
          depth: match.depth
        });
      }
    });
    
    return results;
  },

  saveTemplate: (template: Omit<PatternTemplate, 'id' | 'created'>) => {
    const templates = new Map(get().templates);
    const newTemplate: PatternTemplate = {
      ...template,
      id: uuidv4(),
      created: new Date().toISOString(),
      lastUsed: new Date().toISOString()
    };
    templates.set(newTemplate.id, newTemplate);
    set({ templates });
  },

  removeTemplate: (id: string) => {
    const templates = new Map(get().templates);
    templates.delete(id);
    set({ templates });
  },

  updateTemplateLastUsed: (id: string) => {
    const templates = new Map(get().templates);
    const template = templates.get(id);
    if (template) {
      templates.set(id, {
        ...template,
        lastUsed: new Date().toISOString()
      });
      set({ templates });
    }
  }
}));