import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface SystemGraphProps {
  isDark: boolean;
}

interface Node {
  id: string;
  group: string;
  label: string;
  size: number;
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

export default function SystemGraph({ isDark }: SystemGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Sample data representing system architecture
    const data = {
      nodes: [
        // Core Components
        { id: "core", group: "system", label: "Core System", size: 40 },
        { id: "memory", group: "memory", label: "Memory Store", size: 35 },
        { id: "neural", group: "neural", label: "Neural Network", size: 35 },
        
        // Memory Types
        { id: "semantic", group: "memory", label: "Semantic Memory", size: 25 },
        { id: "episodic", group: "memory", label: "Episodic Memory", size: 25 },
        { id: "procedural", group: "memory", label: "Procedural Memory", size: 25 },
        
        // Neural Components
        { id: "reservoir", group: "neural", label: "Echo State Network", size: 25 },
        { id: "attention", group: "neural", label: "Attention Mechanism", size: 25 },
        { id: "embedding", group: "neural", label: "Embedding Space", size: 25 }
      ],
      links: [
        // Core connections
        { source: "core", target: "memory", value: 1 },
        { source: "core", target: "neural", value: 1 },
        
        // Memory connections
        { source: "memory", target: "semantic", value: 0.7 },
        { source: "memory", target: "episodic", value: 0.7 },
        { source: "memory", target: "procedural", value: 0.7 },
        
        // Neural connections
        { source: "neural", target: "reservoir", value: 0.7 },
        { source: "neural", target: "attention", value: 0.7 },
        { source: "neural", target: "embedding", value: 0.7 }
      ],
      hyperedges: [
        // Memory integration
        { nodes: ["semantic", "episodic", "procedural"], value: 0.8 },
        // Neural processing
        { nodes: ["reservoir", "attention", "embedding"], value: 0.8 },
        // Core integration
        { nodes: ["core", "memory", "neural"], value: 1 }
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
          ? {
              system: "#60A5FA",
              memory: "#34D399",
              neural: "#A78BFA"
            }
          : {
              system: "#3B82F6",
              memory: "#10B981",
              neural: "#8B5CF6"
            };
        return colors[d.group as keyof typeof colors];
      })
      .attr("stroke", isDark ? "#4B5563" : "#9CA3AF")
      .attr("stroke-width", 2);

    // Add pulse animation to nodes
    node.append("circle")
      .attr("r", d => d.size)
      .attr("fill", "none")
      .attr("stroke", d => {
        const colors = isDark 
          ? {
              system: "#60A5FA",
              memory: "#34D399",
              neural: "#A78BFA"
            }
          : {
              system: "#3B82F6",
              memory: "#10B981",
              neural: "#8B5CF6"
            };
        return colors[d.group as keyof typeof colors];
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
      style={{ minHeight: '600px' }}
    />
  );
}