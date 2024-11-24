import React from 'react';
import { Brain, FileCode, Network, Lightbulb } from 'lucide-react';
import { MemoryType } from '../types/memory';

interface MemoryNodeProps {
  type: MemoryType;
  selected?: boolean;
  onClick?: () => void;
}

const typeConfig = {
  declarative: { icon: Brain, color: 'bg-blue-500' },
  procedural: { icon: FileCode, color: 'bg-green-500' },
  episodic: { icon: Network, color: 'bg-pink-500' },
  intentional: { icon: Lightbulb, color: 'bg-purple-500' },
};

export const MemoryNode: React.FC<MemoryNodeProps> = ({
  type,
  selected = false,
  onClick,
}) => {
  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={`
        w-12 h-12 rounded-full ${config.color} 
        flex items-center justify-center cursor-pointer 
        transform transition-all duration-200
        hover:scale-110 
        ${selected ? 'ring-4 ring-white ring-opacity-75 shadow-lg' : ''}
      `}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      <Icon className="w-6 h-6 text-white" />
    </div>
  );
};