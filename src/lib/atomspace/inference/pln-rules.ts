import { Atom, TruthValue } from '../../types';
import { 
  calculateDeduction, 
  calculateInduction, 
  calculateAbduction,
  calculateRevision,
  calculateIntersection,
  calculateUnion,
  calculateComplement
} from '../truth-values/operations';

export interface PLNRule {
  name: string;
  description: string;
  apply: (atoms: Atom[]) => Atom[];
}

export const DeductionRule: PLNRule = {
  name: 'Deduction',
  description: 'If A implies B and B implies C, then A implies C',
  apply: (atoms: Atom[]) => {
    if (atoms.length < 3) return [];
    
    const [A, B, C] = atoms;
    if (!A.truthValue || !B.truthValue || !C.truthValue) return [];

    const tv = calculateDeduction(A.truthValue, B.truthValue);
    
    return [{
      id: `${A.id}->${C.id}`,
      type: 'ImplicationLink',
      name: `Deduction(${A.name},${C.name})`,
      outgoing: [A.id, C.id],
      truthValue: tv
    }];
  }
};

export const ModusPonensRule: PLNRule = {
  name: 'Modus Ponens',
  description: 'If A is true and A implies B, then B is true',
  apply: (atoms: Atom[]) => {
    if (atoms.length < 2) return [];
    
    const [premise, implication] = atoms;
    if (!premise.truthValue || !implication.truthValue) return [];
    if (implication.type !== 'ImplicationLink') return [];
    
    const [, conclusion] = implication.outgoing || [];
    if (!conclusion) return [];

    const tv = calculateDeduction(premise.truthValue, implication.truthValue);
    
    return [{
      id: conclusion,
      type: 'ConceptNode',
      name: `ModusPonens(${premise.name})`,
      truthValue: tv
    }];
  }
};

export const SimilaritySymmetryRule: PLNRule = {
  name: 'Similarity Symmetry',
  description: 'If A is similar to B, then B is similar to A',
  apply: (atoms: Atom[]) => {
    if (atoms.length < 1) return [];
    
    const similarity = atoms[0];
    if (similarity.type !== 'SimilarityLink' || !similarity.truthValue) return [];
    
    const [A, B] = similarity.outgoing || [];
    if (!A || !B) return [];

    return [{
      id: `${B}~${A}`,
      type: 'SimilarityLink',
      name: `Similarity(${B},${A})`,
      outgoing: [B, A],
      truthValue: similarity.truthValue
    }];
  }
};

export const InheritanceTransitivityRule: PLNRule = {
  name: 'Inheritance Transitivity',
  description: 'If A inherits from B and B inherits from C, then A inherits from C',
  apply: (atoms: Atom[]) => {
    if (atoms.length < 2) return [];
    
    const [inherit1, inherit2] = atoms;
    if (inherit1.type !== 'InheritanceLink' || inherit2.type !== 'InheritanceLink') return [];
    if (!inherit1.truthValue || !inherit2.truthValue) return [];
    
    const [A, B1] = inherit1.outgoing || [];
    const [B2, C] = inherit2.outgoing || [];
    
    if (!A || !B1 || !B2 || !C || B1 !== B2) return [];

    const tv = calculateDeduction(inherit1.truthValue, inherit2.truthValue);
    
    return [{
      id: `${A}->${C}`,
      type: 'InheritanceLink',
      name: `Inheritance(${A},${C})`,
      outgoing: [A, C],
      truthValue: tv
    }];
  }
};

export const ConceptFormationRule: PLNRule = {
  name: 'Concept Formation',
  description: 'Form new concepts by combining existing ones using intersection or union',
  apply: (atoms: Atom[]) => {
    if (atoms.length < 2) return [];
    
    const [A, B] = atoms;
    if (!A.truthValue || !B.truthValue) return [];

    const intersectionTv = calculateIntersection(A.truthValue, B.truthValue);
    const unionTv = calculateUnion(A.truthValue, B.truthValue);
    
    return [
      {
        id: `${A.id}&${B.id}`,
        type: 'AndLink',
        name: `Intersection(${A.name},${B.name})`,
        outgoing: [A.id, B.id],
        truthValue: intersectionTv
      },
      {
        id: `${A.id}|${B.id}`,
        type: 'OrLink',
        name: `Union(${A.name},${B.name})`,
        outgoing: [A.id, B.id],
        truthValue: unionTv
      }
    ];
  }
};

export const EquivalenceSymmetryRule: PLNRule = {
  name: 'Equivalence Symmetry',
  description: 'If A is equivalent to B, then B is equivalent to A',
  apply: (atoms: Atom[]) => {
    if (atoms.length < 1) return [];
    
    const equivalence = atoms[0];
    if (equivalence.type !== 'EquivalenceLink' || !equivalence.truthValue) return [];
    
    const [A, B] = equivalence.outgoing || [];
    if (!A || !B) return [];

    return [{
      id: `${B}=${A}`,
      type: 'EquivalenceLink',
      name: `Equivalence(${B},${A})`,
      outgoing: [B, A],
      truthValue: equivalence.truthValue
    }];
  }
};

export const IntensionalInheritanceRule: PLNRule = {
  name: 'Intensional Inheritance',
  description: 'Derive inheritance relationships based on shared properties',
  apply: (atoms: Atom[]) => {
    if (atoms.length < 2) return [];
    
    const [A, B] = atoms;
    if (!A.truthValue || !B.truthValue) return [];

    const tv = calculateInduction(A.truthValue, B.truthValue);
    
    return [{
      id: `${A.id}=>${B.id}`,
      type: 'InheritanceLink',
      name: `IntensionalInheritance(${A.name},${B.name})`,
      outgoing: [A.id, B.id],
      truthValue: tv
    }];
  }
};

export const SubsetDeductionRule: PLNRule = {
  name: 'Subset Deduction',
  description: 'If A is a subset of B and B is a subset of C, then A is a subset of C',
  apply: (atoms: Atom[]) => {
    if (atoms.length < 3) return [];
    
    const [A, B, C] = atoms;
    if (!A.truthValue || !B.truthValue || !C.truthValue) return [];

    const tv = calculateDeduction(A.truthValue, B.truthValue);
    
    return [{
      id: `${A.id}⊆${C.id}`,
      type: 'SubsetLink',
      name: `Subset(${A.name},${C.name})`,
      outgoing: [A.id, C.id],
      truthValue: tv
    }];
  }
};

export const ContextualDeductionRule: PLNRule = {
  name: 'Contextual Deduction',
  description: 'Apply deduction while considering context',
  apply: (atoms: Atom[]) => {
    if (atoms.length < 4) return [];
    
    const [context, A, B, C] = atoms;
    if (!A.truthValue || !B.truthValue || !C.truthValue) return [];

    const contextualTv = calculateDeduction(A.truthValue, B.truthValue);
    const adjustedTv = {
      strength: contextualTv.strength * (context.truthValue?.strength || 1),
      confidence: contextualTv.confidence * (context.truthValue?.confidence || 1)
    };
    
    return [{
      id: `${context.id}:${A.id}->${C.id}`,
      type: 'ContextualImplicationLink',
      name: `ContextualDeduction(${context.name},${A.name},${C.name})`,
      outgoing: [context.id, A.id, C.id],
      truthValue: adjustedTv
    }];
  }
};