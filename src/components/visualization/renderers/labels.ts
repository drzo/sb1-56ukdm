import * as d3 from 'd3';
import { Node } from '../../../data/systems';

export function renderLabels(
  nodeGroups: d3.Selection<SVGGElement, Node, SVGGElement, unknown>,
  isDarkMode: boolean
) {
  return nodeGroups.append('text')
    .text(d => d.name)
    .attr('x', 12)
    .attr('y', 4)
    .attr('font-size', '12px')
    .attr('fill', isDarkMode ? '#fff' : '#000')
    .style('pointer-events', 'none')
    .style('user-select', 'none');
}