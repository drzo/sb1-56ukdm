import React from 'react';
import { useSheafStore } from '../../store/sheafStore';
import { CONNECTION_TYPES } from '../../constants/connectionTypes';

interface SheafConnectionProps {
  sourceId: string;
  targetId: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  type: string;
  sourceHeight: number;
  targetHeight: number;
}

export const SheafConnection: React.FC<SheafConnectionProps> = ({
  sourceId,
  targetId,
  sourceX,
  sourceY,
  targetX,
  targetY,
  type,
  sourceHeight,
  targetHeight
}) => {
  const calculateResonance = useSheafStore(state => state.calculateResonance);
  const resonance = calculateResonance(sourceHeight, targetHeight);
  const config = CONNECTION_TYPES.find(t => t.type === type);

  // Calculate control points for curved path
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const dr = Math.sqrt(dx * dx + dy * dy);
  
  // Curve intensity based on height difference
  const heightDiff = Math.abs(sourceHeight - targetHeight);
  const curveOffset = Math.min(heightDiff * 20, 100);

  const path = `
    M ${sourceX} ${sourceY}
    Q ${(sourceX + targetX) / 2} ${(sourceY + targetY) / 2 - curveOffset}
    ${targetX} ${targetY}
  `;

  return (
    <g>
      {/* Connection path */}
      <path
        d={path}
        fill="none"
        stroke={config?.color.replace('bg-', '') || '#4B5563'}
        strokeWidth={2}
        strokeOpacity={Math.max(0.2, resonance)}
      />

      {/* Height indicators */}
      <text
        x={sourceX}
        y={sourceY - 20}
        textAnchor="middle"
        fill="#9CA3AF"
        fontSize="12"
      >
        h={sourceHeight}
      </text>
      <text
        x={targetX}
        y={targetY - 20}
        textAnchor="middle"
        fill="#9CA3AF"
        fontSize="12"
      >
        h={targetHeight}
      </text>
    </g>
  );
};