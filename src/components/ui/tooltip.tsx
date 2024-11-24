import * as React from 'react';
import { cn } from '../../lib/utils';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}

export const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  ({ content, children, side = 'top', className }, ref) => {
    const [isVisible, setIsVisible] = React.useState(false);

    const positions = {
      top: '-translate-y-full -translate-x-1/2 -mt-2',
      right: 'translate-x-full -translate-y-1/2 ml-2',
      bottom: 'translate-y-full -translate-x-1/2 mt-2',
      left: '-translate-x-full -translate-y-1/2 -ml-2',
    };

    return (
      <div className="relative inline-block" ref={ref}>
        <div
          onMouseEnter={() => setIsVisible(true)}
          onMouseLeave={() => setIsVisible(false)}
        >
          {children}
        </div>
        {isVisible && (
          <div
            className={cn(
              'absolute z-50 px-2 py-1 text-sm text-white bg-gray-900 rounded',
              'pointer-events-none transition-opacity duration-200',
              positions[side],
              className
            )}
            style={{
              [side]: '100%',
              left: side === 'top' || side === 'bottom' ? '50%' : undefined,
              top: side === 'left' || side === 'right' ? '50%' : undefined,
            }}
          >
            {content}
          </div>
        )}
      </div>
    );
  }
);

Tooltip.displayName = 'Tooltip';