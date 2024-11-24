import * as d3 from 'd3';
import { NetworkData, NetworkNode, NetworkEdge } from '../types/VisualizationTypes';
import { Logger } from '../../../cogutil/Logger';

export class NetworkLayout {
  private simulation: d3.Simulation<NetworkNode, NetworkEdge> | null = null;
  private width: number;
  private height: number;

  constructor(width: number = 800, height: number = 600) {
    this.width = width;
    this.height = height;
  }

  updateData(data: NetworkData): void {
    try {
      if (this.simulation) {
        this.simulation.stop();
      }

      this.simulation = d3.forceSimulation<NetworkNode, NetworkEdge>(data.nodes)
        .force('link', d3.forceLink<NetworkNode, NetworkEdge>(data.edges)
          .id(d => d.id)
          .strength(d => Math.abs(d.weight))
        )
        .force('charge', d3.forceManyBody()
          .strength(d => d.type === 'input' ? -100 : -30)
        )
        .force('center', d3.forceCenter(this.width / 2, this.height / 2))
        .force('x', d3.forceX()
          .strength(d => d.type === 'input' ? 0.2 : 0.1)
        )
        .force('y', d3.forceY()
          .strength(d => d.type === 'input' ? 0.2 : 0.1)
        );

      Logger.debug('Network layout updated');
    } catch (error) {
      Logger.error('Failed to update network layout:', error);
    }
  }

  getNodePosition(nodeId: string): { x: number; y: number } | undefined {
    const node = this.simulation?.nodes().find(n => n.id === nodeId);
    return node ? { x: node.x || 0, y: node.y || 0 } : undefined;
  }

  setSize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    
    if (this.simulation) {
      this.simulation.force('center', d3.forceCenter(width / 2, height / 2));
      this.simulation.alpha(0.3).restart();
    }
  }

  dispose(): void {
    this.simulation?.stop();
    this.simulation = null;
  }
}