export interface NetworkNode {
  id: string;
  label: string;
  type: string;
  size?: number;
  color?: string;
  data?: any;
}

export interface NetworkEdge {
  source: string;
  target: string;
  weight?: number;
  label?: string;
  color?: string;
}

export interface NetworkData {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
}

export interface NetworkStats {
  nodes: number;
  edges: number;
  density: number;
  avgDegree: number;
}

export interface NetworkConfig {
  width: number;
  height: number;
  nodeSize: number;
  edgeWidth: number;
  fontSize: number;
  colors: {
    node: string;
    edge: string;
    text: string;
    background: string;
  };
}