import * as d3 from 'd3';
import { Node } from '../../data/systems';

export function setupInteractions(
  nodes: d3.Selection<SVGGElement, Node, SVGGElement, unknown>,
  simulation: d3.Simulation<Node, undefined>,
  zoom: d3.ZoomBehavior<SVGSVGElement, unknown>,
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
) {
  // Node hover effects
  nodes
    .on('mouseover', function() {
      d3.select(this)
        .select('circle')
        .transition()
        .duration(200)
        .attr('r', 10)
        .style('filter', 'brightness(1.2)');
    })
    .on('mouseout', function() {
      d3.select(this)
        .select('circle')
        .transition()
        .duration(200)
        .attr('r', 8)
        .style('filter', null);
    });

  // Double-click to reset zoom
  svg.on('dblclick.zoom', () => {
    const width = parseInt(svg.attr('width'));
    const height = parseInt(svg.attr('height'));
    
    const initialTransform = d3.zoomIdentity
      .translate(width / 2, height / 2)
      .scale(0.8)
      .translate(-width / 2, -height / 2);

    svg.transition()
      .duration(750)
      .call(zoom.transform, initialTransform);
  });
}