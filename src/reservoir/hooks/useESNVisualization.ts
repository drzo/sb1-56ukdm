import { useEffect, useRef, RefObject } from 'react';
import * as d3 from 'd3';
import { ESNState } from '../types/ESNTypes';
import { Logger } from '../../cogutil/Logger';

interface VisualizationConfig {
  width: number;
  height: number;
  colors: {
    positive: string;
    negative: string;
    neutral: string;
    text: string;
    grid: string;
  };
}

export function useESNVisualization(
  svgRef: RefObject<SVGSVGElement>,
  state: ESNState | undefined,
  config: VisualizationConfig
) {
  const visualizationRef = useRef<{
    scales: {
      x: d3.ScaleLinear<number, number>;
      y: d3.ScaleLinear<number, number>;
      color: d3.ScaleSequential<string>;
    };
    zoom: d3.ZoomBehavior<Element, unknown>;
  }>();

  useEffect(() => {
    if (!svgRef.current || !state) return;

    try {
      // Clear previous visualization
      d3.select(svgRef.current).selectAll('*').remove();

      // Create base SVG
      const svg = d3.select(svgRef.current)
        .attr('width', config.width)
        .attr('height', config.height)
        .attr('viewBox', [0, 0, config.width, config.height].join(' '))
        .attr('style', 'max-width: 100%; height: auto;');

      // Create scales
      const xScale = d3.scaleLinear()
        .domain([0, state.weights.reservoir[0].length])
        .range([40, config.width - 40]);

      const yScale = d3.scaleLinear()
        .domain([0, state.weights.reservoir.length])
        .range([40, config.height - 40]);

      const colorScale = d3.scaleSequential()
        .domain([-1, 1])
        .interpolator(d3.interpolateRdBu);

      // Create zoom behavior
      const zoom = d3.zoom()
        .scaleExtent([1, 8])
        .on('zoom', (event) => {
          heatmapGroup.attr('transform', event.transform);
          xAxisGroup.call(xAxis.scale(event.transform.rescaleX(xScale)));
          yAxisGroup.call(yAxis.scale(event.transform.rescaleY(yScale)));
        });

      svg.call(zoom);

      // Create main group for heatmap
      const heatmapGroup = svg.append('g')
        .attr('class', 'heatmap');

      // Draw reservoir weights
      const cellWidth = (config.width - 80) / state.weights.reservoir[0].length;
      const cellHeight = (config.height - 80) / state.weights.reservoir.length;

      state.weights.reservoir.forEach((row, i) => {
        row.forEach((weight, j) => {
          heatmapGroup.append('rect')
            .attr('x', xScale(j))
            .attr('y', yScale(i))
            .attr('width', cellWidth)
            .attr('height', cellHeight)
            .attr('fill', colorScale(weight))
            .attr('stroke', config.colors.grid)
            .attr('stroke-width', 0.5)
            .on('mouseover', (event) => {
              d3.select(event.currentTarget)
                .attr('stroke', config.colors.text)
                .attr('stroke-width', 2);
              
              tooltip
                .style('opacity', 1)
                .html(`Weight: ${weight.toFixed(3)}<br>Position: (${i}, ${j})`);
            })
            .on('mouseout', (event) => {
              d3.select(event.currentTarget)
                .attr('stroke', config.colors.grid)
                .attr('stroke-width', 0.5);
              
              tooltip.style('opacity', 0);
            });
        });
      });

      // Create axes
      const xAxis = d3.axisBottom(xScale).ticks(10);
      const yAxis = d3.axisLeft(yScale).ticks(10);

      const xAxisGroup = svg.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0, ${config.height - 40})`)
        .call(xAxis);

      const yAxisGroup = svg.append('g')
        .attr('class', 'y-axis')
        .attr('transform', `translate(40, 0)`)
        .call(yAxis);

      // Create tooltip
      const tooltip = d3.select(svgRef.current.parentElement)
        .append('div')
        .attr('class', 'absolute hidden p-2 bg-white rounded shadow-lg text-sm')
        .style('opacity', 0);

      // Store references for updates
      visualizationRef.current = {
        scales: { x: xScale, y: yScale, color: colorScale },
        zoom
      };

      Logger.debug('ESN visualization created');
    } catch (error) {
      Logger.error('Failed to create ESN visualization:', error);
    }
  }, [svgRef, state, config]);

  return {
    resetZoom: () => {
      if (visualizationRef.current && svgRef.current) {
        d3.select(svgRef.current)
          .transition()
          .duration(750)
          .call(visualizationRef.current.zoom.transform, d3.zoomIdentity);
      }
    },
    updateColorScale: (domain: [number, number]) => {
      if (visualizationRef.current) {
        visualizationRef.current.scales.color.domain(domain);
      }
    }
  };
}