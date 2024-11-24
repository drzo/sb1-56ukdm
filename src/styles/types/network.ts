export interface Node {
  id: string;
  type: 'input' | 'reservoir' | 'output';
  x?: number;
  y?: number;
  weight: number;
  connections: string[];
}

export interface Link {
  source: string;
  target: string;
  weight: number;
}

export interface NetworkState {
  nodes: Node[];
  links: Link[];
}

export interface ViewConfig {
  zoom: number;
  centerX: number;
  centerY: number;
  selectedNode: string | null;
}