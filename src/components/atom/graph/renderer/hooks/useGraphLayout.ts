import { useCallback } from 'react';
import * as d3 from 'd3';
import { Node, Link, GraphLayout } from '../types';

export const useGraphLayout = (width: number, height: number) => {
  const createForceLayout = useCallback((nodes: Node[], links: Link[]) => {
    return d3.forceSimulation<Node>(nodes)
      .force('link', d3.forceLink<Node, Link>(links).id(d => d.id))
      .force('charge', d3.forceManyBody().strength(-100))
      .force('center', d3.forceCenter(width / 2, height / 2));
  }, [width, height]);

  const createTreeLayout = useCallback((nodes: Node[], links: Link[]) => {
    const hierarchy = d3.stratify<Node>()
      .id(d => d.id)
      .parentId(d => {
        const parentLink = links.find(link => link.target === d.id);
        return parentLink ? parentLink.source : null;
      })(nodes);

    return d3.tree<Node>()
      .size([width, height])
      .separation((a, b) => (a.parent === b.parent ? 1 : 2))(hierarchy);
  }, [width, height]);

  const createRadialLayout = useCallback((nodes: Node[], links: Link[]) => {
    const hierarchy = d3.stratify<Node>()
      .id(d => d.id)
      .parentId(d => {
        const parentLink = links.find(link => link.target === d.id);
        return parentLink ? parentLink.source : null;
      })(nodes);

    return d3.tree<Node>()
      .size([2 * Math.PI, Math.min(width, height) / 2])
      .separation((a, b) => (a.parent === b.parent ? 1 : 2))(hierarchy);
  }, [width, height]);

  return {
    createForceLayout,
    createTreeLayout,
    createRadialLayout
  };
};