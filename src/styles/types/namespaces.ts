export interface Namespace {
  id: string;
  type: 'directory' | 'file' | 'mount';
  name: string;
  path: string;
  content?: string;
  mountPoint?: string;
  children?: Namespace[];
}

export interface MountPoint {
  id: string;
  source: string;
  target: string;
  type: string;
}

export interface NamespaceNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  type: 'directory' | 'file' | 'mount';
  path: string;
  level: number;
}

export interface NamespaceLink extends d3.SimulationLinkDatum<NamespaceNode> {
  source: string;
  target: string;
  type: 'child' | 'mount';
}