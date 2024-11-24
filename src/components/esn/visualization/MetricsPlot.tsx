import { useRef, useEffect, useMemo } from 'react';
import * as d3 from 'd3';
import { ESNMetrics } from '@/reservoir/types/ESNTypes';
import { Logger } from '@/cogutil/Logger';

interface MetricsPlotProps {
  metrics: ESNMetrics[];
  width?: number;
  height?: number;
  showLegend?: boolean;
}

export function MetricsPlot({
  metrics,
  width = 600,
  height = 200,
  showLegend = true
}: MetricsPlotProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  const processedData = useMemo(() => ({
    accuracy: metrics.map((m, i) => ({ x: i, y: m.accuracy })),
    stability: metrics.map((m, i) => ({ x: i, y: m.stability })),
    complexity: metrics.map((m, i) => ({ x: i, y: m.complexity }))
  }), [metrics]);

  useEffect(() => {
    if (!svgRef.current || metrics.length === 0) return;

    try {
      const svg = d3.select(svgRef.current);
      svg.selectAll('*').remove();

      const margin = { top: 20, right: 30, bottom: 30, left: 40 };
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
      const line = d3.line<{ x: number; y: number }>()
        .x(d => xScale(d.x))
        .y(d => yScale(d.y))
        .curve(d3.curveMonotoneX);

      // Create container
      const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // Add axes
      g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale).ticks(5));

      g.append('g')
        .call(d3.axisLeft(yScale).ticks(5));

      // Add grid lines
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

      // Add lines
      const lines = [
        { name: 'Accuracy', color: '#22c55e', data: processedData.accuracy },
        { name: 'Stability', color: '#3b82f6', data: processedData.stability },
        { name: 'Complexity', color: '#f59e0b', data: processedData.complexity }
      ];

      lines.forEach(({ name, color, data }) => {
        g.append('path')
          .datum(data)
          .attr('fill', 'none')
          .attr('stroke', color)
          .attr('stroke-width', 2)
          .attr('d', line);

        // Add dots
        g.selectAll(`circle-${name}`)
          .data(data)
          .enter()
          .append('circle')
          .attr('cx', d => xScale(d.x))
          .attr('cy', d => yScale(d.y))
          .attr('r', 3)
          .attr('fill', color);
      });

      // Add legend
      if (showLegend) {
        const legend = svg.append('g')
          .attr('font-size', 10)
          .attr('text-anchor', 'start')
          .selectAll('g')
          .data(lines)
          .enter()
          .append('g')
          .attr('transform', (_, i) => `translate(${width - 100},${margin.top + i * 20})`);

        legend.append('line')
          .attr('x1', 0)
          .attr('x2', 20)
          .attr('stroke', d => d.color)
          .attr('stroke-width', 2);

        legend.append('text')
          .attr('x', 25)
          .attr('y', 4)
          .text(d => d.name);
      }

      Logger.debug('Metrics plot rendered');
    } catch (error) {
      Logger.error('Failed to render metrics plot:', error);
    }
  }, [metrics, width, height, showLegend, processedData]);

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