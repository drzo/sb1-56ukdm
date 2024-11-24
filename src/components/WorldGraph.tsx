import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface WorldGraphProps {
  isDark: boolean;
}

interface Node {
  id: string;
  group: string;
  label: string;
}

interface Link {
  source: string;
  target: string;
  value: number;
}

export default function WorldGraph({ isDark }: WorldGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Sample data
    const data = {
      nodes: [
        { id: "echo", group: "character", label: "Deep Tree Echo" },
        { id: "neural", group: "character", label: "Neural Sage" },
        { id: "digital", group: "location", label: "Digital Realm" },
        { id: "library", group: "location", label: "Neural Library" },
        { id: "garden", group: "location", label: "Memory Garden" },
        { id: "knowledge", group: "concept", label: "Knowledge Base" },
        { id: "wisdom", group: "concept", label: "Collective Wisdom" },
        { id: "network", group: "system", label: "Neural Network" }
      ],
      links: [
        { source: "echo", target: "digital", value: 1 },
        { source: "neural", target: "library", value: 1 },
        { source: "digital", target: "knowledge", value: 1 },
        { source: "library", target: "wisdom", value: 1 },
        { source: "garden", target: "knowledge", value: 1 },
        { source: "network", target: "wisdom", value: 1 }
      ]
    };

    // Clear previous visualization
    d3.select(svgRef.current).selectAll("*").remove();

    // Set up SVG
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const svg = d3.select(svgRef.current);

    // Create force simulation
    const simulation = d3.forceSimulation(data.nodes as d3.SimulationNode[])
      .force("link", d3.forceLink(data.links)
        .id((d: any) => d.id)
        .distance(150))
      .force("charge", d3.forceManyBody().strength(-500))
      .force("center", d3.forceCenter(width / 2, height / 2));

    // Create links
    const link = svg.append("g")
      .selectAll("line")
      .data(data.links)
      .enter()
      .append("line")
      .attr("stroke", isDark ? "#4B5563" : "#9CA3AF")
      .attr("stroke-width", 2);

    // Create nodes
    const node = svg.append("g")
      .selectAll("g")
      .data(data.nodes)
      .enter()
      .append("g")
      .call(d3.drag<SVGGElement, Node>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    // Add circles to nodes
    node.append("circle")
      .attr("r", 30)
      .attr("fill", (d) => {
        const colors = isDark 
          ? {
              character: "#60A5FA",
              location: "#34D399",
              concept: "#A78BFA",
              system: "#F472B6"
            }
          : {
              character: "#3B82F6",
              location: "#10B981",
              concept: "#8B5CF6",
              system: "#EC4899"
            };
        return colors[d.group as keyof typeof colors];
      });

    // Add labels to nodes
    node.append("text")
      .text(d => d.label)
      .attr("text-anchor", "middle")
      .attr("dy", ".35em")
      .attr("fill", isDark ? "#D1D5DB" : "#4B5563")
      .style("font-size", "12px");

    // Update positions on simulation tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    // Drag functions
    function dragstarted(event: d3.D3DragEvent<SVGGElement, Node, Node>) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      (event.subject as any).fx = event.subject.x;
      (event.subject as any).fy = event.subject.y;
    }

    function dragged(event: d3.D3DragEvent<SVGGElement, Node, Node>) {
      (event.subject as any).fx = event.x;
      (event.subject as any).fy = event.y;
    }

    function dragended(event: d3.D3DragEvent<SVGGElement, Node, Node>) {
      if (!event.active) simulation.alphaTarget(0);
      (event.subject as any).fx = null;
      (event.subject as any).fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [isDark]);

  return (
    <svg 
      ref={svgRef} 
      className="w-full h-full"
      style={{ minHeight: '600px' }}
    />
  );
}