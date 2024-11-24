import React from 'react';
import { Connection } from '../../../types/memory';

interface LinksProps {
  links: Array<{
    source: { x: number; y: number; id: string };
    target: { x: number; y: number; id: string };
    type: Connection['type'];
  }>;
}

export const Links: React.FC<LinksProps> = ({ links }) => {
  return (
    <g className="links">
      {links.map((link, i) => (
        <line
          key={`${link.source.id}-${link.target.id}-${i}`}
          x1={link.source.x}
          y1={link.source.y}
          x2={link.target.x}
          y2={link.target.y}
          stroke="#4B5563"
          strokeWidth={2}
        />
      ))}
    </g>
  );
};