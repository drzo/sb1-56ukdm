export interface VisualizationConfig {
  width: number;
  height: number;
  backgroundColor: string;
  cameraPosition: {
    x: number;
    y: number;
    z: number;
  };
  nodeSize: number;
  edgeWidth: number;
  colors: {
    node: string;
    edge: string;
    text: string;
    background: string;
  };
}

export interface NetworkNode {
  id: string;
  type: 'input' | 'reservoir' | 'output';
  value: number;
  position?: {
    x: number;
    y: number;
    z: number;
  };
}

export interface NetworkEdge {
  source: string;
  target: string;
  weight: number;
}

export interface NetworkData {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
}

export interface VisualizationStats {
  fps: number;
  nodeCount: number;
  edgeCount: number;
  renderTime: number;
}