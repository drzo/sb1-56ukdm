import { NodeType, LinkType } from '../../types/AtomTypes';

// Map chemical types to core AtomTypes
export const ChemNodeType = {
  ATOM: NodeType.ATOM,
  MOLECULE: NodeType.CONCEPT,
  FUNCTIONAL_GROUP: NodeType.CONCEPT,
  REACTION: NodeType.PREDICATE,
  ELEMENT: NodeType.CONCEPT
} as const;

export const ChemLinkType = {
  SINGLE_BOND: LinkType.LIST,
  DOUBLE_BOND: LinkType.LIST,
  TRIPLE_BOND: LinkType.LIST,
  AROMATIC_BOND: LinkType.LIST,
  PARTICIPATES: LinkType.MEMBER,
  CATALYZES: LinkType.EVALUATION
} as const;

export interface AtomInfo {
  symbol: string;
  atomicNumber: number;
  mass: number;
  electronegativity?: number;
  oxidationStates: number[];
  valenceElectrons: number;
}

export interface BondInfo {
  type: LinkType;
  order: number;
  length: number;
  energy: number;
}

export interface MoleculeInfo {
  formula: string;
  smiles: string;
  inchi?: string;
  mass: number;
  charge: number;
  bonds: BondInfo[];
}