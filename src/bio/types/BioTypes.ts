import { NodeType, LinkType } from '../../types/AtomTypes';

// These enums are now just type aliases to the main AtomTypes
export const BioNodeType = {
  GENE: NodeType.GENE,
  PROTEIN: NodeType.PROTEIN,
  PATHWAY: NodeType.PATHWAY,
  DISEASE: NodeType.DISEASE,
  ORGANISM: NodeType.ORGANISM
} as const;

export const BioLinkType = {
  EXPRESSES: LinkType.EXPRESSES,
  INTERACTS: LinkType.INTERACTS,
  PARTICIPATES: LinkType.PARTICIPATES,
  ASSOCIATED: LinkType.ASSOCIATED,
  LOCATED: LinkType.LOCATED
} as const;

export interface GeneInfo {
  id: string;
  symbol: string;
  name: string;
  organism: string;
  chromosome?: string;
  location?: {
    start: number;
    end: number;
    strand: '+' | '-';
  };
  sequence?: string;
}

export interface ProteinInfo {
  id: string;
  name: string;
  sequence: string;
  length: number;
  domains?: string[];
  functions?: string[];
  locations?: string[];
}

export interface PathwayInfo {
  id: string;
  name: string;
  description: string;
  type: string;
  participants: string[];
  references?: string[];
}

export interface DiseaseInfo {
  id: string;
  name: string;
  description: string;
  symptoms: string[];
  genes?: string[];
  variants?: string[];
}