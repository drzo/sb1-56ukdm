import { useCallback } from 'react';
import * as d3 from 'd3';
import { Node, Link } from '../types';

export const useGraphInteractions = () => {
  const handleDragStart = useCallback((event: d3.D3DragEvent<SVGGElement, Node, Node>, simulation: d3.Simulation<Node, Link>) => {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }, []);

  const handleDrag = useCallback((event: d3.D3DragEvent<SVGGElement, Node, Node>) => {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }, []);

  const handleDragEnd = useCallback((event: d3.D3DragEvent<SVGGElement, Node, Node>, simulation: d3.Simulation<Node, Link>) => {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }, []);

  const setupDragBehavior = useCallback((simulation: d3.Simulation<Node, Link>) => {
    return d3.drag<SVGGElement, Node>()
      .on('start', (event) => handleDragStart(event, simulation))
      .on('drag', handleDrag)
      .on('end', (event) => handleDragEnd(event, simulation));
  }, []);

  return {
    setupDragBehavior
  };
};