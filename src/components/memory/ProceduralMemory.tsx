import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface Procedure {
  id: number;
  name: string;
  steps: string[];
  state: 'idle' | 'running' | 'completed' | 'failed';
  lastRun?: number;
  dependencies?: number[];
}

interface ProceduralMemoryProps {
  showVisualization?: boolean;
  showMetrics?: boolean;
}

export default function ProceduralMemory({ 
  showVisualization = true,
  showMetrics = true 
}: ProceduralMemoryProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  const { data: procedures } = useQuery<Procedure[]>({
    queryKey: ['proceduralMemory'],
    queryFn: async () => [
      {
        id: 1,
        name: "Community Event Organization",
        steps: [
          "Define event objectives",
          "Allocate resources",
          "Coordinate participants"
        ],
        state: "completed",
        lastRun: Date.now() - 86400000,
        dependencies: [2]
      },
      {
        id: 2,
        name: "Skill Sharing Workshop",
        steps: [
          "Identify expertise areas",
          "Match mentors with learners",
          "Schedule sessions"
        ],
        state: "running",
        dependencies: [3]
      },
      {
        id: 3,
        name: "Resource Allocation",
        steps: [
          "Inventory check",
          "Budget planning",
          "Distribution"
        ],
        state: "idle"
      }
    ]
  });

  useEffect(() => {
    if (!procedures || !svgRef.current || !showVisualization) return;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const margin = { top: 40, right: 40, bottom: 40, left: 40 };

    svg.selectAll('*').remove();

    // Create hierarchical layout
    const hierarchy = d3.stratify<Procedure>()
      .id(d => d.id.toString())
      .parentId(d => d.dependencies?.[0]?.toString())
      (procedures);

    const treeLayout = d3.tree<Procedure>()
      .size([width - margin.left - margin.right, height - margin.top - margin.bottom]);

    const root = treeLayout(hierarchy);

    // Create container for the visualization
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add links
    g.selectAll('path.link')
      .data(root.links())
      .join('path')
      .attr('class', 'link')
      .attr('d', d3.linkVertical()
        .x(d => d.x)
        .y(d => d.y))
      .attr('fill', 'none')
      .attr('stroke', '#94a3b8')
      .attr('stroke-width', 2);

    // Add nodes
    const nodes = g.selectAll('g.node')
      .data(root.descendants())
      .join('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x},${d.y})`);

    // Add node circles
    nodes.append('circle')
      .attr('r', 8)
      .attr('fill', d => {
        switch (d.data.state) {
          case 'running': return '#eab308';
          case 'completed': return '#22c55e';
          case 'failed': return '#ef4444';
          default: return '#94a3b8';
        }
      })
      .attr('class', 'transition-colors duration-300 hover:opacity-80');

    // Add node labels
    nodes.append('text')
      .attr('dy', '0.31em')
      .attr('x', d => d.children ? -12 : 12)
      .attr('text-anchor', d => d.children ? 'end' : 'start')
      .attr('class', 'text-sm fill-current dark:text-white')
      .text(d => d.data.name);

  }, [procedures, showVisualization]);

  if (!procedures) return null;

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
            <h3 className="text-lg font-medium dark:text-white">Procedures</h3>
            <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
              New Procedure
            </button>
          </div>

          <div className="space-y-4">
            {procedures.map(proc => (
              <div 
                key={proc.id}
                className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-medium dark:text-white">{proc.name}</h4>
                    {proc.lastRun && (
                      <p className="text-sm text-gray-500">
                        Last run: {new Date(proc.lastRun).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <span className={`
                    px-2 py-1 rounded text-sm
                    ${proc.state === 'running' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' :
                      proc.state === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' :
                      proc.state === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'}
                  `}>
                    {proc.state}
                  </span>
                </div>

                <div className="space-y-2">
                  {proc.steps.map((step, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                    >
                      <span className="w-6 h-6 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-full">
                        {index + 1}
                      </span>
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}