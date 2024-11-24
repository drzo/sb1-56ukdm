import { useRef, useEffect, useMemo } from 'react';
import * as d3 from 'd3';
import { ESNState } from '@/reservoir/types/ESNTypes';
import { Logger } from '@/cogutil/Logger';

interface StateHeatmapProps {
  state: ESNState;
  width?: number;
  height?: number;
  colorScale?: [string, string];
}

export function StateHeatmap({
  state,
  width = 600,
  height = 400,
  colorScale = ['#ef4444', '#22c55e']
}: StateHeatmapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  
  const data = useMemo(() => ({
    values: state.state,
    min: Math.min(...state.state),
    max: Math.max(...state.state)
  }), [state]);

  useEffect(() => {
    if (!svgRef.current) return;

    try {
      const svg = d3.select(svgRef.current);
      svg.selectAll('*').remove();

      const margin = { top: 20, right: 20, bottom: 30, left: 40 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      // Create color scale
      const color = d3.scaleSequential()
        .domain([data.min, data.max])
        .interpolator(d3.interpolate(colorScale[0], colorScale[1]));

      // Create container
      const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // Calculate cell dimensions
      const cellWidth = innerWidth / Math.ceil(Math.sqrt(data.values.length));
      const cellHeight = innerHeight / Math.ceil(Math.sqrt(data.values.length));

      // Create cells
      const cells = g.selectAll('rect')
        .data(data.values)
        .enter()
        .append('rect')
        .attr('x', (_, i) => (i % Math.ceil(Math.sqrt(data.values.length))) * cellWidth)
        .attr('y', (_, i) => Math.floor(i / Math.ceil(Math.sqrt(data.values.length))) * cellHeight)
        .attr('width', cellWidth - 1)
        .attr('height', cellHeight - 1)
        .attr('fill', d => color(d))
        .attr('rx', 2)
        .attr('ry', 2);

      // Add hover effects
      const tooltip = d3.select(svgRef.current.parentElement)
        .append('div')
        .attr('class', 'absolute hidden bg-black/75 text-white p-2 rounded text-sm')
        .style('pointer-events', 'none');

      cells
        .on('mouseover', (event, d) => {
          d3.select(event.currentTarget)
            .attr('stroke', '#000')
            .attr('stroke-width', 2);

          tooltip
            .style('display', 'block')
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY - 10}px`)
            .html(`Value: ${d.toFixed(3)}`);
        })
        .on('mouseout', (event) => {
          d3.select(event.currentTarget)
            .attr('stroke', 'none');
          
          tooltip.style('display', 'none');
        });

      // Add color scale legend
      const legendWidth = 200;
      const legendHeight = 10;

      const legendScale = d3.scaleLinear()
        .domain([data.min, data.max])
        .range([0, legendWidth]);

      const legendAxis = d3.axisBottom(legendScale)
        .ticks(5)
        .tickFormat(d => d.toFixed(2));

      const legend = svg.append('g')
        .attr('transform', `translate(${margin.left},${height - margin.bottom + 10})`);

      const gradientId = `heatmap-gradient-${Math.random().toString(36).substr(2, 9)}`;

      const gradient = legend.append('defs')
        .append('linearGradient')
        .attr('id', gradientId)
        .attr('x1', '0%')
        .attr('x2', '100%')
        .attr('y1', '0%')
        .attr('y2', '0%');

      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', colorScale[0]);

      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', colorScale[1]);

      legend.append('rect')
        .attr('width', legendWidth)
        .attr('height', legendHeight)
        .style('fill', `url(#${gradientId})`);

      legend.append('g')
        .attr('transform', `translate(0,${legendHeight})`)
        .call(legendAxis);

      Logger.debug('State heatmap rendered');
    } catch (error) {
      Logger.error('Failed to render state heatmap:', error);
    }
  }, [state, width, height, colorScale, data]);

  return (
    <div className="relative">
      <svg 
        ref={svgRef}
        width={width}
        height={height}
        className="bg-card rounded-lg"
        viewBox={`0 0 ${width} ${height}`}
      />
    </div>
  );
}