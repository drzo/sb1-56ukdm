import * as d3 from 'd3';
import { SystemData } from '../../../data/systems';

export function createForceLayout(data: SystemData, width: number, height: number) {
  return d3.forceSimulation(data.nodes)
    .force('link', d3.forceLink(data.links)
      .id(d => d.id)
      .strength(d => (d as any).value * 0.1)
    )
    .force('charge', d3.forceManyBody()
      .strength(d => -100 - (d as any).group.length * 100)
    )
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius(30))
    .force('x', d3.forceX(width / 2).strength(0.1))
    .force('y', d3.forceY(height / 2).strength(0.1))
    .alphaDecay(0.02);
}