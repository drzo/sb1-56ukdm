import * as d3 from 'd3';
import { NetworkData, NetworkNode, NetworkEdge } from '../types';
import { Logger } from '../../../cogutil/Logger';

export class ForceDirectedLayout {
  private simulation: d3.Simulation<NetworkNode, NetworkEdge>;
  private width: number;
  private height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.simulation = this.createSimulation();
    Logger.info('ForceDirectedLayout initialized');
  }

  private createSimulation(): d3.Simulation<NetworkNode, NetworkEdge> {
    return d3.forceSimulation<NetworkNode, NetworkEdge>()
      .force('charge', d3.forceManyBody().strength(-50))
      .force('center', d3.forceCenter(0, 0))
      .force('link', d3.forceLink<NetworkNode, NetworkEdge>()
        .id(d => d.id)
        .distance(30)
      )
      .on('tick', () => this.onTick());
  }

  private onTick(): void {
    // Override in subclasses if needed
  }

  updateData(data: NetworkData): void {
    this.simulation.nodes(data.nodes);
    this.simulation
      .force<d3.ForceLink<NetworkNode, NetworkEdge>>('link')
      ?.links(data.edges);
    
    this.simulation.alpha(1).restart();
  }

  getNodePosition(node: NetworkNode): { x: number; y: number } {
    return {
      x: (node as any).x || 0,
      y: (node as any).y || 0
    };
  }

  setSize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.simulation.force('center', d3.forceCenter(width / 2, height / 2));
  }

  stop(): void {
    this.simulation.stop();
  }
}