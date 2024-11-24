import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface Concept {
  id: number;
  name: string;
  properties: Record<string, string>;
  relations: Array<{
    id: number;
    type: string;
    target: string;
  }>;
}

interface SemanticMemoryProps {
  showVisualization?: boolean;
  showMetrics?: boolean;
}

interface SimulationNode {
  id: string;
  type: 'concept' | 'target';
  properties?: Record<string, string>;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface SimulationLink {
  source: string;
  target: string;
  type: string;
}

export default function SemanticMemory({ 
  showVisualization = true,
  showMetrics = true 
}: SemanticMemoryProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  const { data: concepts } = useQuery<Concept[]>({
    queryKey: ['semanticMemory'],
    queryFn: async () => [
      {
        id: 1,
        name: "Community Center",
        properties: {
          type: "facility",
          purpose: "gathering",
          capacity: "200"
        },
        relations: [
          { id: 1, type: "hosts", target: "Events" },
          { id: 2, type: "serves", target: "Local Residents" }
        ]
      },
      {
        id: 2,
        name: "Skills Program",
        properties: {
          type: "initiative",
          duration: "6 months",
          participants: "youth"
        },
        relations: [
          { id: 3, type: "uses", target: "Community Center" },
          { id: 4, type: "involves", target: "Mentors" }
        ]
      }
    ]
  });

  useEffect(() => {
    if (!concepts || !svgRef.current || !showVisualization) return;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    svg.selectAll('*').remove();

    // Create nodes and links arrays
    const nodes: SimulationNode[] = [];
    const links: SimulationLink[] = [];

    // Add concept nodes and their relations
    concepts.forEach(concept => {
      nodes.push({
        id: concept.name,
        type: 'concept',
        properties: concept.properties
      });

      concept.relations.forEach(relation => {
        // Add target node if it doesn't exist
        if (!nodes.find(n => n.id === relation.target)) {
          nodes.push({
            id: relation.target,
            type: 'target'
          });
        }

        links.push({
          source: concept.name,
          target: relation.target,
          type: relation.type
        });
      });
    });

    // Create force simulation
    const simulation = d3.forceSimulation<SimulationNode>(nodes)
      .force('link', d3.forceLink<SimulationNode, SimulationLink>(links)
        .id(d => d.id)
        .distance(100))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2));

    // Create container group
    const g = svg.append('g');

    // Create links
    const link = g.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#94a3b8')
      .attr('stroke-width', 2);

    // Create nodes
    const node = g.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('class', 'node')
      .call(d3.drag<SVGGElement, SimulationNode>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    // Add circles to nodes
    node.append('circle')
      .attr('r', d => d.type === 'concept' ? 8 : 6)
      .attr('fill', d => d.type === 'concept' ? '#3b82f6' : '#94a3b8');

    // Add labels to nodes
    node.append('text')
      .attr('dx', 12)
      .attr('dy', '.35em')
      .attr('class', 'text-sm fill-current dark:text-white')
      .text(d => d.id);

    // Add relationship labels
    const linkLabels = g.append('g')
      .selectAll('text')
      .data(links)
      .join('text')
      .attr('class', 'text-xs fill-current dark:text-white')
      .attr('text-anchor', 'middle')
      .text(d => d.type);

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as SimulationNode).x!)
        .attr('y1', d => (d.source as SimulationNode).y!)
        .attr('x2', d => (d.target as SimulationNode).x!)
        .attr('y2', d => (d.target as SimulationNode).y!);

      node.attr('transform', d => `translate(${d.x},${d.y})`);

      linkLabels
        .attr('x', d => ((d.source as SimulationNode).x! + (d.target as SimulationNode).x!) / 2)
        .attr('y', d => ((d.source as SimulationNode).y! + (d.target as SimulationNode).y!) / 2);
    });

    function dragstarted(event: d3.D3DragEvent<SVGGElement, SimulationNode, SimulationNode>) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: d3.D3DragEvent<SVGGElement, SimulationNode, SimulationNode>) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: d3.D3DragEvent<SVGGElement, SimulationNode, SimulationNode>) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [concepts, showVisualization]);

  if (!concepts) return null;

  return (
    <div className="h-full">
      {showVisualization && (
        <div className="h-full">
          <svg ref={svgRef} className="w-full h-full" />
        </div>
      )}

      {showMetrics && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium dark:text-white">Concepts</h3>
            <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
              Add Concept
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {concepts.map(concept => (
              <div 
                key={concept.id}
                className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
              >
                <h4 className="font-medium dark:text-white mb-4">{concept.name}</h4>
                
                <div className="space-y-4">
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Properties
                    </h5>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(concept.properties).map(([key, value]) => (
                        <div key={key} className="text-gray-600 dark:text-gray-400">
                          {key}: {value}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Relations
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {concept.relations.map(relation => (
                        <span 
                          key={relation.id}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded text-sm"
                        >
                          {relation.type} → {relation.target}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}