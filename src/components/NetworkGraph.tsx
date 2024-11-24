import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface Node {
  id: string;
  group: number;
  size: number;
  label: string;
}

interface Link {
  source: string;
  target: string;
  value: number;
}

interface Hyperedge {
  nodes: string[];
  value: number;
}

interface NetworkData {
  nodes: Node[];
  links: Link[];
  hyperedges: Hyperedge[];
}

interface NetworkGraphProps {
  isDark: boolean;
}

export default function NetworkGraph({ isDark }: NetworkGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Sample data with hyperedges
    const data: NetworkData = {
      nodes: [
        // Input layer
        { id: "i1", group: 1, size: 15, label: "Input 1" },
        { id: "i2", group: 1, size: 15, label: "Input 2" },
        { id: "i3", group: 1, size: 15, label: "Input 3" },
        // Hidden layer 1
        { id: "h1", group: 2, size: 20, label: "Hidden 1" },
        { id: "h2", group: 2, size: 20, label: "Hidden 2" },
        { id: "h3", group: 2, size: 20, label: "Hidden 3" },
        { id: "h4", group: 2, size: 20, label: "Hidden 4" },
        // Hidden layer 2
        { id: "h5", group: 3, size: 18, label: "Hidden 5" },
        { id: "h6", group: 3, size: 18, label: "Hidden 6" },
        { id: "h7", group: 3, size: 18, label: "Hidden 7" },
        // Output layer
        { id: "o1", group: 4, size: 15, label: "Output 1" },
        { id: "o2", group: 4, size: 15, label: "Output 2" }
      ],
      links: [
        // Regular connections
        { source: "i1", target: "h1", value: 0.8 },
        { source: "i2", target: "h2", value: 0.7 },
        { source: "i3", target: "h3", value: 0.5 },
        { source: "h1", target: "h5", value: 0.8 },
        { source: "h2", target: "h6", value: 0.7 },
        { source: "h3", target: "h7", value: 0.5 },
        { source: "h5", target: "o1", value: 0.8 },
        { source: "h6", target: "o2", value: 0.7 }
      ],
      hyperedges: [
        // Hyperedges connecting multiple nodes
        { nodes: ["i1", "i2", "h1"], value: 0.9 },
        { nodes: ["i2", "i3", "h2"], value: 0.8 },
        { nodes: ["h1", "h2", "h5"], value: 0.7 },
        { nodes: ["h5", "h6", "o1"], value: 0.85 },
        { nodes: ["h6", "h7", "o2"], value: 0.75 }
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
        .distance(100)
        .strength(0.7))
      .force("charge", d3.forceManyBody().strength(-500))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("x", d3.forceX(width / 2).strength(0.1))
      .force("y", d3.forceY(height / 2).strength(0.1));

    // Create hyperedge surfaces
    const hyperedgeGroup = svg.append("g")
      .attr("class", "hyperedges");

    const hyperedgeSurfaces = hyperedgeGroup.selectAll("path")
      .data(data.hyperedges)
      .enter()
      .append("path")
      .attr("fill", isDark ? "rgba(99, 102, 241, 0.15)" : "rgba(79, 70, 229, 0.1)")
      .attr("stroke", isDark ? "rgba(99, 102, 241, 0.3)" : "rgba(79, 70, 229, 0.2)")
      .attr("stroke-width", 1)
      .style("pointer-events", "none");

    // Create regular links
    const link = svg.append("g")
      .selectAll("line")
      .data(data.links)
      .enter()
      .append("line")
      .attr("stroke-width", d => Math.sqrt(d.value) * 2)
      .attr("stroke", isDark ? "#6366F1" : "#4F46E5")
      .style("opacity", 0.3);

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
      .attr("r", d => d.size)
      .attr("fill", d => {
        const colors = isDark 
          ? ["#60A5FA", "#34D399", "#A78BFA", "#F472B6"] 
          : ["#3B82F6", "#10B981", "#8B5CF6", "#EC4899"];
        return colors[d.group - 1];
      })
      .attr("stroke", isDark ? "#4B5563" : "#9CA3AF")
      .attr("stroke-width", 2);

    // Add pulse animation to nodes
    node.append("circle")
      .attr("r", d => d.size)
      .attr("fill", "none")
      .attr("stroke", d => {
        const colors = isDark 
          ? ["#60A5FA", "#34D399", "#A78BFA", "#F472B6"] 
          : ["#3B82F6", "#10B981", "#8B5CF6", "#EC4899"];
        return colors[d.group - 1];
      })
      .attr("stroke-width", 2)
      .attr("opacity", 0.3)
      .style("animation", "pulse 2s infinite");

    // Add labels to nodes
    node.append("text")
      .text(d => d.label)
      .attr("x", d => d.size + 5)
      .attr("y", 5)
      .style("font-size", "12px")
      .attr("fill", isDark ? "#D1D5DB" : "#4B5563");

    // Update positions on simulation tick
    simulation.on("tick", () => {
      // Update regular links
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      // Update hyperedge surfaces
      hyperedgeSurfaces.attr("d", (d: Hyperedge) => {
        const points = d.nodes.map(nodeId => {
          const node = data.nodes.find(n => n.id === nodeId);
          return node ? [
            (node as any).x,
            (node as any).y
          ] : null;
        }).filter(p => p !== null);

        if (points.length >= 3) {
          return `M ${points[0]![0]},${points[0]![1]} 
                  L ${points[1]![0]},${points[1]![1]} 
                  L ${points[2]![0]},${points[2]![1]} Z`;
        }
        return "";
      });

      // Update node positions
      node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    // Drag functions
    function dragstarted(event: d3.D3DragEvent<SVGGElement, Node, Node>, d: Node) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      (d as any).fx = (d as any).x;
      (d as any).fy = (d as any).y;
    }

    function dragged(event: d3.D3DragEvent<SVGGElement, Node, Node>, d: Node) {
      (d as any).fx = event.x;
      (d as any).fy = event.y;
    }

    function dragended(event: d3.D3DragEvent<SVGGElement, Node, Node>, d: Node) {
      if (!event.active) simulation.alphaTarget(0);
      (d as any).fx = null;
      (d as any).fy = null;
    }

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [isDark]);

  return (
    <svg 
      ref={svgRef} 
      className="w-full h-full"
      style={{ minHeight: '400px' }}
    />
  );
}