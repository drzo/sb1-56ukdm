import * as d3 from 'd3';
import { Link } from '../../../data/systems';

export function renderLinks(
  container: d3.Selection<SVGGElement, unknown, null, undefined>,
  links: Link[],
  isDarkMode: boolean
) {
  return container.append('g')
    .selectAll('line')
    .data(links)
    .join('line')
    .attr('stroke', isDarkMode ? '#666' : '#999')
    .attr('stroke-opacity', 0.6)
    .attr('stroke-width', d => Math.sqrt(d.value))
    .style('pointer-events', 'none');
}