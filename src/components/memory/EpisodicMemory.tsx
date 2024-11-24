import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface Episode {
  id: number;
  timestamp: number;
  event: string;
  context: string;
  connections: number[];
}

interface EpisodicMemoryProps {
  showVisualization?: boolean;
  showMetrics?: boolean;
}

export default function EpisodicMemory({ 
  showVisualization = true,
  showMetrics = true 
}: EpisodicMemoryProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  const { data: episodes } = useQuery<Episode[]>({
    queryKey: ['episodicMemory'],
    queryFn: async () => [
      {
        id: 1,
        timestamp: Date.now() - 3600000,
        event: "Community meeting discussion",
        context: "Local development plans",
        connections: [2, 3]
      },
      {
        id: 2,
        timestamp: Date.now() - 7200000,
        event: "Youth program session",
        context: "Skills development",
        connections: [1, 4]
      },
      {
        id: 3,
        timestamp: Date.now() - 10800000,
        event: "Local market setup",
        context: "Business development",
        connections: [1, 2]
      }
    ]
  });

  useEffect(() => {
    if (!episodes || !svgRef.current || !showVisualization) return;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const margin = { top: 40, right: 40, bottom: 40, left: 40 };

    svg.selectAll('*').remove();

    // Create timeline layout
    const timeScale = d3.scaleTime()
      .domain([
        d3.min(episodes, d => d.timestamp) || 0,
        d3.max(episodes, d => d.timestamp) || 0
      ])
      .range([margin.left, width - margin.right]);

    // Add timeline axis
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(timeScale));

    // Add episodes
    const episodeGroup = svg.append('g');

    episodes.forEach((episode, i) => {
      const x = timeScale(episode.timestamp);
      const y = height / 2;

      // Add episode node
      episodeGroup.append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', 8)
        .attr('fill', '#3b82f6')
        .attr('class', 'transition-colors duration-300 hover:fill-blue-400');

      // Add connections
      episode.connections.forEach(connId => {
        const connEpisode = episodes.find(e => e.id === connId);
        if (connEpisode) {
          episodeGroup.append('path')
            .attr('d', d3.line()([[x, y], [timeScale(connEpisode.timestamp), y]]))
            .attr('stroke', '#94a3b8')
            .attr('stroke-width', 2)
            .attr('fill', 'none');
        }
      });

      // Add label
      episodeGroup.append('text')
        .attr('x', x)
        .attr('y', y - 20)
        .attr('text-anchor', 'middle')
        .attr('class', 'text-sm fill-current dark:text-white')
        .text(episode.event);
    });

  }, [episodes, showVisualization]);

  if (!episodes) return null;

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
            <h3 className="text-lg font-medium dark:text-white">Episodes</h3>
            <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
              Record Episode
            </button>
          </div>

          <div className="space-y-4">
            {episodes.map(episode => (
              <div 
                key={episode.id}
                className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
              >
                <div className="flex justify-between mb-2">
                  <h4 className="font-medium dark:text-white">{episode.event}</h4>
                  <span className="text-sm text-gray-500">
                    {new Date(episode.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Context: {episode.context}
                </p>
                <div className="flex gap-2">
                  {episode.connections.map(conn => (
                    <span 
                      key={conn}
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded text-sm"
                    >
                      Episode {conn}
                    </span>
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