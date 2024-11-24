import * as d3 from 'd3';
import { Group } from '../../../data/systems';

export function createGroupHulls(
  container: d3.Selection<SVGGElement, unknown, null, undefined>,
  groups: Group[],
  isDarkMode: boolean
) {
  return container.selectAll('path.hull')
    .data(groups)
    .join('path')
    .attr('class', 'hull')
    .style('fill', d => d3.color(d.color)?.darker(0.3).toString() || '')
    .style('fill-opacity', isDarkMode ? 0.2 : 0.1)
    .style('stroke', d => d.color)
    .style('stroke-width', 1.5)
    .style('stroke-opacity', 0.3)
    .style('pointer-events', 'none');
}