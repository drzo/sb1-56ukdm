import { useQuery } from '@tanstack/react-query';
import * as d3 from 'd3';
import { useEffect, useRef } from 'react';

interface MemoryIndexProps {
  showVisualization?: boolean;
  showMetrics?: boolean;
}

export default function MemoryIndex({ 
  showVisualization = true, 
  showMetrics = true 
}: MemoryIndexProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  const { data: stats } = useQuery({
    queryKey: ['memoryStats'],
    queryFn: async () => ({
      declarative: { facts: 128, rules: 45, active: 32 },
      episodic: { episodes: 256, connections: 512, recent: 24 },
      procedural: { procedures: 64, active: 12, completed: 48 },
      semantic: { concepts: 384, relations: 768, categories: 56 }
    })
  });

  useEffect(() => {
    if (!stats || !svgRef.current || !showVisualization) return;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const radius = Math.min(width, height) / 2;

    svg.selectAll('*').remove();

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const pie = d3.pie()
      .value((d: any) => d.value)
      .sort(null);

    const arc = d3.arc()
      .innerRadius(radius * 0.6)
      .outerRadius(radius * 0.9);

    const data = Object.entries(stats).map(([key, value]) => ({
      name: key,
      value: Object.values(value).reduce((a, b) => a + b, 0)
    }));

    const g = svg.append('g')
      .attr('transform', `translate(${width/2},${height/2})`);

    const path = g.selectAll('path')
      .data(pie(data as any))
      .enter()
      .append('path')
      .attr('d', arc as any)
      .attr('fill', (d: any) => color(d.data.name))
      .attr('class', 'transition-all duration-300 hover:opacity-80')
      .attr('stroke', 'white')
      .style('stroke-width', '2px');

    const label = g.selectAll('text')
      .data(pie(data as any))
      .enter()
      .append('text')
      .attr('transform', (d: any) => `translate(${arc.centroid(d)})`)
      .attr('dy', '.35em')
      .attr('class', 'text-xs font-medium fill-current dark:text-white')
      .attr('text-anchor', 'middle')
      .text((d: any) => d.data.name);

  }, [stats, showVisualization]);

  if (!stats) return null;

  return (
    <div className="h-full">
      {showVisualization && (
        <div className="h-full">
          <svg ref={svgRef} className="w-full h-full" />
        </div>
      )}

      {showMetrics && (
        <div className="grid grid-cols-1 gap-4">
          {Object.entries(stats).map(([type, data]) => (
            <div key={type} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <h3 className="text-lg font-medium mb-2 dark:text-white capitalize">
                {type} Memory
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(data).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400 capitalize">
                      {key}:
                    </span>
                    <span className="font-medium dark:text-white">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}