import React from 'react';
import { RecursiveOptions } from '../../../../lib/types';

interface PatternRecursiveToggleProps {
  recursive?: RecursiveOptions;
  onChange: (recursive?: RecursiveOptions) => void;
}

export const PatternRecursiveToggle: React.FC<PatternRecursiveToggleProps> = ({
  recursive,
  onChange
}) => {
  const handleToggle = (enabled: boolean) => {
    if (enabled) {
      onChange({
        maxDepth: 5,
        followLinks: true,
        detectCycles: true
      });
    } else {
      onChange(undefined);
    }
  };

  const handleMaxDepthChange = (depth: number) => {
    onChange({
      ...recursive,
      maxDepth: depth
    });
  };

  const handleFollowLinksChange = (follow: boolean) => {
    onChange({
      ...recursive,
      followLinks: follow
    });
  };

  const handleDetectCyclesChange = (detect: boolean) => {
    onChange({
      ...recursive,
      detectCycles: detect
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="enable-recursive"
          checked={!!recursive}
          onChange={(e) => handleToggle(e.target.checked)}
          className="rounded"
        />
        <label htmlFor="enable-recursive" className="text-sm font-medium">
          Enable Recursive Matching
        </label>
      </div>

      {recursive && (
        <div className="pl-5 space-y-3">
          <div className="space-y-2">
            <label className="block text-sm">Max Depth</label>
            <input
              type="range"
              min="1"
              max="10"
              value={recursive.maxDepth || 5}
              onChange={(e) => handleMaxDepthChange(parseInt(e.target.value))}
              className="w-full"
            />
            <span className="text-sm text-gray-600">
              Current: {recursive.maxDepth || 5}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="follow-links"
              checked={recursive.followLinks || false}
              onChange={(e) => handleFollowLinksChange(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="follow-links" className="text-sm">
              Follow Links
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="detect-cycles"
              checked={recursive.detectCycles || false}
              onChange={(e) => handleDetectCyclesChange(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="detect-cycles" className="text-sm">
              Detect Cycles
            </label>
          </div>
        </div>
      )}
    </div>
  );
};