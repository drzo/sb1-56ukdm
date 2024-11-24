import * as d3 from 'd3';
import { Node } from '../../../data/systems';

export function renderNodes(
  container: d3.Selection<SVGGElement, unknown, null, undefined>,
  nodes: Node[],
  simulation: d3.Simulation<Node, undefined>,
  isDarkMode: boolean
) {
  const nodeGroups = container.append('g')
    .selectAll('g')
    .data(nodes)
    .join('g')
    .attr('class', 'node')
    .call(drag(simulation));

  // Add circles
  nodeGroups.append('circle')
    .attr('r', 8)
    .attr('fill', d => d.color)
    .attr('stroke', isDarkMode ? '#fff' : '#000')
    .attr('stroke-width', 1)
    .attr('stroke-opacity', 0.3)
    .style('cursor', 'pointer');

  // Add tooltips
  nodeGroups.append('title')
    .text(d => `${d.name}\n${d.description}`);

  return nodeGroups;
}

function drag(simulation: d3.Simulation<Node, undefined>) {
  return d3.drag<SVGGElement, Node>()
    .on('start', (event, d) => {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    })
    .on('drag', (event, d) => {
      d.fx = event.x;
      d.fy = event.y;
    })
    .on('end', (event, d) => {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    });
}