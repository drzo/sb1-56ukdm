import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface DataPoint {
  x: number;
  y: number;
  z: number;
  cluster: number;
}

export default function SemanticRidge() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const margin = { top: 40, right: 40, bottom: 40, left: 40 };

    svg.selectAll('*').remove();

    // Create semantic ridge visualization
    const data: DataPoint[] = d3.range(50).map(() => ({
      x: Math.random() * (width - margin.left - margin.right) + margin.left,
      y: Math.random() * (height - margin.top - margin.bottom) + margin.top,
      z: Math.random(),
      cluster: Math.floor(Math.random() * 5)
    }));

    // Create 3D-like projection
    const projection = d3.geoMercator()
      .scale(300)
      .center([width / 2, height / 2]);

    // Add semantic clusters
    const clusters = svg.append('g')
      .selectAll('g')
      .data(d3.group(data, d => d.cluster))
      .join('g');

    // Add connections within clusters
    clusters.each(function(cluster) {
      const points = cluster[1];
      const hull = d3.polygonHull(points.map(d => [d.x, d.y] as [number, number]));
      
      if (hull) {
        d3.select(this).append('path')
          .attr('d', `M${hull.join('L')}Z`)
          .attr('fill', d3.schemeCategory10[cluster[0]])
          .attr('fill-opacity', 0.2)
          .attr('stroke', d3.schemeCategory10[cluster[0]])
          .attr('stroke-width', 1);
      }
    });

    // Add points
    const points = svg.append('g')
      .selectAll<SVGCircleElement, DataPoint>('circle')
      .data(data)
      .join('circle')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', 4)
      .attr('fill', d => d3.schemeCategory10[d.cluster]);

    // Add ridge lines
    const ridges = svg.append('g');
    data.forEach((d1) => {
      data.forEach((d2) => {
        if (d1 !== d2 && d1.cluster === d2.cluster && Math.random() < 0.2) {
          ridges.append('line')
            .attr('x1', d1.x)
            .attr('y1', d1.y)
            .attr('x2', d2.x)
            .attr('y2', d2.y)
            .attr('stroke', d3.schemeCategory10[d1.cluster])
            .attr('stroke-width', 0.5)
            .attr('opacity', 0.3);
        }
      });
    });

  }, []);

  return <svg ref={svgRef} className="w-full h-full" />;
}