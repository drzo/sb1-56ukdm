import { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { Logger } from '@/cogutil/Logger';

interface WeightMatrixProps {
  weights: number[][];
  width?: number;
  height?: number;
  colorScale?: [string, string];
}

export function WeightMatrix({
  weights,
  width = 300,
  height = 300,
  colorScale = ['#ef4444', '#22c55e']
}: WeightMatrixProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !weights.length) return;

    try {
      const svg = d3.select(svgRef.current);
      svg.selectAll('*').remove();

      const margin = { top: 20, right: 20, bottom: 30, left: 40 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      // Calculate cell dimensions
      const cellWidth = innerWidth / weights[0].length;
      const cellHeight = innerHeight / weights.length;

      // Create color scale
      const color = d3.scaleSequential()
        .domain([d3.min(weights.flat())!, d3.max(weights.flat())!])
        .interpolator(d3.interpolate(colorScale[0], colorScale[1]));

      // Create container
      const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // Create cells
      weights.forEach((row, i) => {
        row.forEach((value, j) => {
          g.append('rect')
            .attr('x', j * cellWidth)
            .attr('y', i * cellHeight)
            .attr('width', cellWidth - 1)
            .attr('height', cellHeight - 1)
            .attr('fill', color(value))
            .attr('rx', 2)
            .attr('ry', 2)
            .on('mouseover', (event) => {
              d3.select(event.currentTarget)
                .attr('stroke', '#000')
                .attr('stroke-width', 2);

              tooltip
                .style('display', 'block')
                .style('left', `${event.pageX + 10}px`)
                .style('top', `${event.pageY - 10}px`)
                .html(`Value: ${value.toFixed(3)}`);
            })
            .on('mouseout', (event) => {
              d3.select(event.currentTarget)
                .attr('stroke', 'none');
              tooltip.style('display', 'none');
            });
        });
      });

      // Add tooltip
      const tooltip = d3.select(svgRef.current.parentElement)
        .append('div')
        .attr('class', 'absolute hidden bg-black/75 text-white p-2 rounded text-sm')
        .style('pointer-events', 'none');

      // Add axes
      const xAxis = d3.axisBottom(d3.scaleLinear()
        .domain([0, weights[0].length])
        .range([0, innerWidth]));

      const yAxis = d3.axisLeft(d3.scaleLinear()
        .domain([0, weights.length])
        .range([0, innerHeight]));

      g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(xAxis);

      g.append('g')
        .call(yAxis);

      Logger.debug('Weight matrix visualization rendered');
    } catch (error) {
      Logger.error('Failed to render weight matrix:', error);
    }
  }, [weights, width, height, colorScale]);

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