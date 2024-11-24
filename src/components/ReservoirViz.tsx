import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface ReservoirVizProps {
  state?: number[];
}

export default function ReservoirViz({ state }: ReservoirVizProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!state || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };

    svg.selectAll('*').remove();

    const x = d3.scaleLinear()
      .domain([0, state.length - 1])
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .domain([d3.min(state) || -1, d3.max(state) || 1])
      .range([height - margin.bottom, margin.top]);

    // Add bars
    svg.selectAll('rect')
      .data(state)
      .join('rect')
      .attr('x', (_, i) => x(i))
      .attr('y', d => y(Math.max(0, d)))
      .attr('height', d => Math.abs(y(d) - y(0)))
      .attr('width', width / state.length - 1)
      .attr('fill', d => d >= 0 ? '#3b82f6' : '#ef4444');

    // Add axes
    svg.append('g')
      .attr('transform', `translate(0,${y(0)})`)
      .call(d3.axisBottom(x));

    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

  }, [state]);

  return (
    <svg 
      ref={svgRef} 
      className="w-full h-full"
    />
  );
}