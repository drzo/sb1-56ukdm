import * as React from 'react';
import { cn } from '../../lib/utils';

export interface SliderProps {
  label?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  className?: string;
}

export const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  ({ label, value, min, max, step = 1, onChange, className }, ref) => {
    const percentage = ((value - min) / (max - min)) * 100;

    return (
      <div ref={ref} className={cn("space-y-2", className)}>
        {label && (
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-gray-700">
              {label}
            </label>
            <span className="text-sm text-gray-500">
              {value.toFixed(2)}
            </span>
          </div>
        )}
        <div className="relative">
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className="absolute h-2 bg-indigo-500 rounded-full"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className={cn(
              "absolute inset-0 w-full h-2 opacity-0 cursor-pointer",
              "focus:outline-none focus:ring-2 focus:ring-indigo-500"
            )}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-md border border-gray-300"
            style={{ left: `${percentage}%`, transform: `translateX(-50%) translateY(-50%)` }}
          />
        </div>
      </div>
    );
  }
);

Slider.displayName = 'Slider';