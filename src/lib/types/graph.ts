import { SimulationNodeDatum, SimulationLinkDatum } from 'd3';

export interface Node extends SimulationNodeDatum {
  id: string;
  name: string;
  type: string;
}

export interface Link extends SimulationLinkDatum<Node> {
  source: string;
  target: string;
}

export type GraphLayout = 'force' | 'tree' | 'radial';