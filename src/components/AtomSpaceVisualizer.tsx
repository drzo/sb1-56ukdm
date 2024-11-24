import React, { useEffect, useRef } from 'react';
import { Network } from 'lucide-react';
import * as d3 from 'd3';
import { useStore } from '../store';
import { AtomSpaceData } from '../types';
import Controls from './Controls';

export default function AtomSpaceVisualizer() {
  const svgRef = useRef<SVGSVGElement>(null);
  const atomSpace = useStore((state) => state.atomSpace);
  
  useEffect(() => {
    if (!atomSpace || !svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // Clear previous visualization
    svg.selectAll("*").remove();

    const simulation = d3.forceSimulation(atomSpace.nodes)
      .force("link", d3.forceLink(atomSpace.edges)
        .id((d: any) => d.id)
        .distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const edges = svg.append("g")
      .selectAll("line")
      .data(atomSpace.edges)
      .enter()
      .append("line")
      .style("stroke", "#999")
      .style("stroke-opacity", 0.6)
      .style("stroke-width", (d: any) => Math.sqrt(d.value || 1));

    const nodes = svg.append("g")
      .selectAll("circle")
      .data(atomSpace.nodes)
      .enter()
      .append("circle")
      .attr("r", 5)
      .style("fill", (d: any) => getNodeColor(d.type))
      .call(drag(simulation) as any);

    const labels = svg.append("g")
      .selectAll("text")
      .data(atomSpace.nodes)
      .enter()
      .append("text")
      .text((d: any) => d.label)
      .attr("font-size", 8)
      .attr("dx", 12)
      .attr("dy", 4);

    simulation.on("tick", () => {
      edges
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      nodes
        .attr("cx", (d: any) => d.x)
        .attr("cy", (d: any) => d.y);

      labels
        .attr("x", (d: any) => d.x)
        .attr("y", (d: any) => d.y);
    });

  }, [atomSpace]);

  function getNodeColor(type: string) {
    const colors: Record<string, string> = {
      'ConceptNode': '#4CAF50',
      'PredicateNode': '#2196F3', 
      'EvaluationLink': '#9C27B0',
      'ListLink': '#FF9800',
      'default': '#607D8B'
    };
    return colors[type] || colors.default;
  }

  function drag(simulation: d3.Simulation<any, undefined>) {
    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }
    
    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }
    
    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }
    
    return d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
  }

  if (!atomSpace) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <Network className="w-6 h-6 mr-2" />
        <span>No AtomSpace data available</span>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <Controls />
      <div className="flex-1">
        <svg ref={svgRef} className="w-full h-full" />
      </div>
    </div>
  );
}