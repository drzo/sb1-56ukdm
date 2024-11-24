import { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { ESNState } from '@/reservoir/types/ESNTypes';
import { Logger } from '@/cogutil/Logger';

interface FeedbackVisualizerProps {
  state: ESNState;
  width?: number;
  height?: number;
}

export function FeedbackVisualizer({
  state,
  width = 300,
  height = 300
}: FeedbackVisualizerProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !state.weights.feedback) return;

    try {
      const svg = d3.select(svgRef.current);
      svg.selectAll('*').remove();

      const margin = { top: 20, right: 20, bottom: 30, left: 40 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      // Create scales
      const xScale = d3.scaleLinear()
        .domain([0, state.weights.feedback[0].length])
        .range([0, innerWidth]);

      const yScale = d3.scaleLinear()
        .domain([0, state.weights.feedback.length])
        .range([0, innerHeight]);

      const colorScale = d3.scaleSequential()
        .domain([-1, 1])
        .interpolator(d3.interpolateRdBu);

      // Create container
      const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // Draw feedback weights
      state.weights.feedback.forEach((row, i) => {
        row.forEach((weight, j) => {
          g.append('rect')
            .attr('x', xScale(j))
            .attr('y', yScale(i))
            .attr('width', innerWidth / row.length)
            .attr('height', innerHeight / state.weights.feedback.length)
            .attr('fill', colorScale(weight))
            .attr('stroke', '#ccc')
            .attr('stroke-width', 0.5)
            .on('mouseover', (event) => {
              d3.select(event.currentTarget)
                .attr('stroke', '#000')
                .attr('stroke-width', 2);

              tooltip
                .style('display', 'block')
                .style('left', `${event.pageX + 10}px`)
                .style('top', `${event.pageY - 10}px`)
                .html(`Feedback Weight: ${weight.toFixed(3)}`);
            })
            .on('mouseout', (event) => {
              d3.select(event.currentTarget)
                .attr('stroke', '#ccc')
                .attr('stroke-width', 0.5);
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
      const xAxis = d3.axisBottom(xScale);
      const yAxis = d3.axisLeft(yScale);

      g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(xAxis);

      g.append('g')
        .call(yAxis);

      Logger.debug('Feedback visualization rendered');
    } catch (error) {
      Logger.error('Failed to render feedback visualization:', error);
    }
  }, [state, width, height]);

  if (!state.weights.feedback) {
    return (
      <div className="flex items-center justify-center h-[300px] bg-muted rounded-lg">
        <p className="text-muted-foreground">No feedback connections</p>
      </div>
    );
  }

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