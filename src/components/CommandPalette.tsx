import React from 'react';
import {
  KBarProvider,
  KBarPortal,
  KBarPositioner,
  KBarAnimator,
  KBarSearch,
  useMatches,
  NO_GROUP,
} from 'kbar';

function RenderResults() {
  const { results } = useMatches();

  return (
    <div className="max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden">
      {results.map((item, index) => (
        <div
          key={index}
          className={`px-4 py-2 cursor-pointer ${
            item === results[0] ? 'bg-indigo-50' : 'hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center space-x-2">
            {item.icon && <span className="text-gray-500">{item.icon}</span>}
            <span>{item.name}</span>
          </div>
          {item.subtitle && (
            <span className="text-sm text-gray-500">{item.subtitle}</span>
          )}
        </div>
      ))}
    </div>
  );
}

interface CommandPaletteProps {
  children: React.ReactNode;
  actions: any[];
}

export default function CommandPalette({ children, actions }: CommandPaletteProps) {
  return (
    <KBarProvider actions={actions}>
      <KBarPortal>
        <KBarPositioner className="fixed inset-0 bg-black/50 z-50">
          <KBarAnimator className="max-w-xl w-full">
            <div className="overflow-hidden rounded-lg shadow-xl">
              <KBarSearch className="w-full px-4 py-3 text-lg border-b focus:outline-none" />
              <RenderResults />
            </div>
          </KBarAnimator>
        </KBarPositioner>
      </KBarPortal>
      {children}
    </KBarProvider>
  );
}