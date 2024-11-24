import React from 'react';
import { MEMORY_TYPES_CONFIG } from '../../../constants/memoryTypes';
import { MemoryType } from '../../../types/memory';

interface NodeGroupProps {
  id: string;
  type: MemoryType;
  x: number;
  y: number;
  isSelected: boolean;
  isSource: boolean;
  isConnectionMode: boolean;
  onClick: (event: React.MouseEvent) => void;
  onMouseOver: () => void;
  onMouseOut: () => void;
}

export const NodeGroup: React.FC<NodeGroupProps> = ({
  id,
  type,
  x,
  y,
  isSelected,
  isSource,
  isConnectionMode,
  onClick,
  onMouseOver,
  onMouseOut,
}) => {
  const config = MEMORY_TYPES_CONFIG[type];
  const cursor = isConnectionMode
    ? isSource ? 'not-allowed' : 'crosshair'
    : 'pointer';

  return (
    <g
      transform={`translate(${x},${y})`}
      style={{ cursor }}
      onClick={onClick}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
    >
      <circle
        r={24}
        fill={config.color}
        stroke={isSource || isSelected ? '#FFFFFF' : 'none'}
        strokeWidth={3}
      />
      <path
        d={config.path}
        fill="none"
        stroke="#FFFFFF"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="translate(-12, -12)"
      />
    </g>
  );
};