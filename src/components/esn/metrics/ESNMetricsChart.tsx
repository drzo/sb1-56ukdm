import { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { ESNMetrics } from '@/reservoir/types/ESNTypes';
import { Logger } from '@/cogutil/Logger';

interface ESNMetricsChartProps {
  metrics: ESNMetrics[];
  width?: number;
  height?: number;
  showLegend?: boolean;
}

export function ESNMetricsChart({
  metrics,
  width = 600,
  height = 200,
  showLegend = true
}: ESNMetricsChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || metrics.length === 0) return;

    try {
      // Clear previous chart
      d3.select(svgRef.current).selectAll('*').remove();

      const margin = { top: 20, right: 20, bottom: 30, left: 40 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      // Create scales
      const xScale = d3.scaleLinear()
        .domain([0, metrics.length - 1])
        .range([0, innerWidth]);

      const yScale = d3.scaleLinear()
        .domain([0, 1])
        .range([innerHeight, 0]);

      // Create line generators
      const accuracyLine = d3.line<ESNMetrics>()
        .x((_, i) => xScale(i))
        .y(d => yScale(d.accuracy))
        .curve(d3.curveMonotoneX);

      const stabilityLine = d3.line<ESNMetrics>()
        .x((_, i) => xScale(i))
        .y(d => yScale(d.stability))
        .curve(d3.curveMonotoneX);

      // Create SVG
      const svg = d3.select(svgRef.current)
        .attr('width', width)
        .attr('height', height);

      const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // Add grid
      g.append('g')
        .attr('class', 'grid')
        .selectAll('line')
        .data(yScale.ticks(5))
        .enter()
        .append('line')
        .attr('x1', 0)
        .attr('x2', innerWidth)
        .attr('y1', d => yScale(d))
        .attr('y2', d => yScale(d))
        .attr('stroke', 'currentColor')
        .attr('stroke-opacity', 0.1);

      // Add axes
      g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale).ticks(5));

      g.append('g')
        .call(d3.axisLeft(yScale).ticks(5));

      // Add lines
      g.append('path')
        .datum(metrics)
        .attr('fill', 'none')
        .attr('stroke', 'hsl(var(--primary))')
        .attr('stroke-width', 2)
        .attr('d', accuracyLine);

      g.append('path')
        .datum(metrics)
        .attr('fill', 'none')
        .attr('stroke', 'hsl(var(--muted-foreground))')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '4,4')
        .attr('d', stabilityLine);

      // Add dots
      g.selectAll('circle.accuracy')
        .data(metrics)
        .enter()
        .append('circle')
        .attr('class', 'accuracy')
        .attr('cx', (_, i) => xScale(i))
        .attr('cy', d => yScale(d.accuracy))
        .attr('r', 3)
        .attr('fill', 'hsl(var(--primary))');

      g.selectAll('circle.stability')
        .data(metrics)
        .enter()
        .append('circle')
        .attr('class', 'stability')
        .attr('cx', (_, i) => xScale(i))
        .attr('cy', d => yScale(d.stability))
        .attr('r', 3)
        .attr('fill', 'hsl(var(--muted-foreground))');

      // Add legend if enabled
      if (showLegend) {
        const legend = svg.append('g')
          .attr('font-size', 10)
          .attr('text-anchor', 'start')
          .selectAll('g')
          .data([
            { label: 'Accuracy', color: 'hsl(var(--primary))' },
            { label: 'Stability', color: 'hsl(var(--muted-foreground))' }
          ])
          .enter()
          .append('g')
          .attr('transform', (_, i) => `translate(${width - 100},${margin.top + i * 20})`);

        legend.append('line')
          .attr('x1', 0)
          .attr('x2', 20)
          .attr('stroke', d => d.color)
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', (_, i) => i === 1 ? '4,4' : null);

        legend.append('text')
          .attr('x', 25)
          .attr('y', 4)
          .text(d => d.label);
      }

      Logger.debug('Metrics chart rendered');
    } catch (error) {
      Logger.error('Failed to render metrics chart:', error);
    }
  }, [metrics, width, height, showLegend]);

  return (
    <svg 
      ref={svgRef}
      className="w-full h-full"
      style={{ minHeight: '200px' }}
    />
  );
}