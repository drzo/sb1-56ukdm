import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface LogicalFiber {
  id: number;
  type: 'proposition' | 'predicate' | 'type';
  value: string;
  baseType?: string;
  fiberSpace?: string[];
}

interface DeclarativeMemoryProps {
  showVisualization?: boolean;
  showMetrics?: boolean;
}

export default function DeclarativeMemory({ 
  showVisualization = true,
  showMetrics = true 
}: DeclarativeMemoryProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !showVisualization) return;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const radius = Math.min(width, height) / 3;

    svg.selectAll('*').remove();

    // Create main group for the visualization
    const g = svg.append('g')
      .attr('transform', `translate(${width/2},${height/2})`);

    // Create base space (types)
    const baseSpace = g.append('g').attr('class', 'base-space');
    
    // Draw base circle
    baseSpace.append('circle')
      .attr('r', radius)
      .attr('fill', 'none')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 2);

    // Create fiber spaces
    const fibers: LogicalFiber[] = [
      {
        id: 1,
        type: 'type',
        value: 'Person',
        fiberSpace: ['Identity', 'Properties', 'Relations']
      },
      {
        id: 2,
        type: 'predicate',
        value: 'isTeacher',
        baseType: 'Person',
        fiberSpace: ['True', 'False']
      },
      {
        id: 3,
        type: 'proposition',
        value: 'John is a teacher',
        baseType: 'Person',
        fiberSpace: ['Verified']
      }
    ];

    const fiberAngles = d3.pie<LogicalFiber>()(fibers.map(() => 1));
    
    fibers.forEach((fiber, i) => {
      const angle = fiberAngles[i];
      if (!angle) return;

      const fiberG = g.append('g')
        .attr('transform', `rotate(${(angle.startAngle + angle.endAngle) * 90 / Math.PI})`);

      // Draw fiber line
      fiberG.append('line')
        .attr('x1', 0)
        .attr('y1', -radius)
        .attr('x2', 0)
        .attr('y2', -radius * 1.5)
        .attr('stroke', '#94a3b8')
        .attr('stroke-width', 2);

      // Draw fiber space
      if (fiber.fiberSpace) {
        const fiberRadius = radius * 0.3;

        fiberG.append('circle')
          .attr('cx', 0)
          .attr('cy', -radius * 1.5)
          .attr('r', fiberRadius)
          .attr('fill', 'none')
          .attr('stroke', '#3b82f6')
          .attr('stroke-width', 2);

        // Add fiber elements
        const fiberElements = d3.pie<string>()(fiber.fiberSpace.map(() => 1));
        fiber.fiberSpace.forEach((element, j) => {
          const elemAngle = fiberElements[j];
          if (!elemAngle) return;

          const x = Math.cos(elemAngle.startAngle) * fiberRadius;
          const y = Math.sin(elemAngle.startAngle) * fiberRadius - radius * 1.5;
          
          fiberG.append('text')
            .attr('x', x)
            .attr('y', y)
            .attr('text-anchor', 'middle')
            .attr('class', 'text-xs fill-current dark:text-white')
            .text(element);
        });
      }

      // Add labels
      fiberG.append('text')
        .attr('x', 0)
        .attr('y', -radius * 1.8)
        .attr('text-anchor', 'middle')
        .attr('class', 'text-sm font-medium fill-current dark:text-white')
        .text(fiber.value);
    });

  }, [showVisualization]);

  return (
    <div className="h-full">
      {showVisualization && (
        <div className="h-full">
          <svg ref={svgRef} className="w-full h-full" />
        </div>
      )}

      {showMetrics && (
        <div className="space-y-6">
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <h3 className="text-lg font-medium mb-4 dark:text-white">
              Logical Structure
            </h3>
            {/* Metrics content */}
          </div>
        </div>
      )}
    </div>
  );
}