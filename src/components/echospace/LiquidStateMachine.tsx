import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export default function LiquidStateMachine() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };

    svg.selectAll('*').remove();

    // Create LSM visualization with spiking neurons
    const neurons = d3.range(100).map(() => ({
      x: Math.random() * (width - margin.left - margin.right) + margin.left,
      y: Math.random() * (height - margin.top - margin.bottom) + margin.top,
      state: Math.random(),
      lastSpike: Math.random() * 1000
    }));

    const g = svg.append('g');

    // Add connections
    const connections = g.append('g');
    neurons.forEach((n1, i) => {
      neurons.forEach((n2, j) => {
        if (i !== j && Math.random() < 0.05) {
          connections.append('line')
            .attr('x1', n1.x)
            .attr('y1', n1.y)
            .attr('x2', n2.x)
            .attr('y2', n2.y)
            .attr('stroke', '#94a3b8')
            .attr('stroke-width', 0.5)
            .attr('opacity', 0.3);
        }
      });
    });

    // Add neurons
    const neuronGroups = g.selectAll('g.neuron')
      .data(neurons)
      .join('g')
      .attr('class', 'neuron')
      .attr('transform', d => `translate(${d.x},${d.y})`);

    neuronGroups.append('circle')
      .attr('r', 4)
      .attr('fill', '#3b82f6')
      .attr('class', 'transition-colors duration-300');

    // Animate spikes
    function updateSpikes() {
      neurons.forEach((neuron, i) => {
        if (Math.random() < 0.1) {
          neuron.state = 1;
          neuron.lastSpike = Date.now();
          
          neuronGroups.filter((_, j) => i === j)
            .select('circle')
            .attr('fill', '#ef4444')
            .transition()
            .duration(100)
            .attr('fill', '#3b82f6');
        }
      });
    }

    const interval = setInterval(updateSpikes, 100);

    return () => clearInterval(interval);
  }, []);

  return <svg ref={svgRef} className="w-full h-full" />;
}