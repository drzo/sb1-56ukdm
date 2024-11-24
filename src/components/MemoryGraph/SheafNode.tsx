import React from 'react';
import { useSheafStore } from '../../store/sheafStore';
import { MEMORY_TYPES_CONFIG } from '../../constants/memoryTypes';
import { MemoryType } from '../../types/memory';

interface SheafNodeProps {
  id: string;
  type: MemoryType;
  x: number;
  y: number;
  selected: boolean;
  onClick: () => void;
}

export const SheafNode: React.FC<SheafNodeProps> = ({
  id,
  type,
  x,
  y,
  selected,
  onClick
}) => {
  const sheafNode = useSheafStore(state => state.sheafNodes.get(id));
  const config = MEMORY_TYPES_CONFIG[type];

  if (!sheafNode) return null;

  // Calculate node size based on number of branches
  const baseSize = 24;
  const branchCount = sheafNode.branches.size;
  const size = baseSize + Math.min(branchCount * 2, 12);

  // Calculate average resonance across branches
  const avgResonance = Array.from(sheafNode.branches.values()).reduce(
    (sum, branch) => sum + (branch.metrics?.resonance || 0),
    0
  ) / branchCount;

  return (
    <g
      transform={`translate(${x},${y})`}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      {/* Resonance halo */}
      {avgResonance > 0 && (
        <circle
          r={size + 6}
          fill="none"
          stroke={config.color}
          strokeOpacity={Math.min(avgResonance * 0.5, 0.5)}
          strokeWidth={2}
        />
      )}

      {/* Base circle */}
      <circle
        r={size}
        fill={config.color}
        stroke={selected ? '#FFFFFF' : 'none'}
        strokeWidth={3}
      />

      {/* Branch indicators */}
      {Array.from(sheafNode.branches.entries()).map(([height], index) => {
        const angle = (index * 2 * Math.PI) / branchCount;
        return (
          <circle
            key={height}
            cx={Math.cos(angle) * (size - 8)}
            cy={Math.sin(angle) * (size - 8)}
            r={4}
            fill="#FFFFFF"
            fillOpacity={0.6}
          />
        );
      })}

      {/* Memory type icon */}
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