import React, { useMemo } from 'react';
import * as diff from 'diff';

interface DiffViewerProps {
  oldString: string;
  newString: string;
  viewType: 'split' | 'inline';
  isJson?: boolean;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ oldString, newString, viewType, isJson = false }) => {
  const diffResult = useMemo(() => {
    if (!oldString && !newString) return [];
    if (isJson) {
      // diffJson takes objects
      try {
        const oldObj = oldString ? JSON.parse(oldString) : {};
        const newObj = newString ? JSON.parse(newString) : {};
        return diff.diffJson(oldObj, newObj);
      } catch (e) {
        // Fallback to diffLines if invalid JSON
        return diff.diffLines(oldString, newString);
      }
    }
    return diff.diffLines(oldString, newString);
  }, [oldString, newString, isJson]);

  if (viewType === 'split') {
    return (
      <div className="grid grid-cols-2 gap-4">
        {/* Left Side (Old) */}
        <div className="font-mono text-sm whitespace-pre-wrap break-all overflow-x-auto p-4 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-800">
          {diffResult.map((part, index) => {
            if (part.added) return null; // Don't show added in old side
            const className = part.removed ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200' : 'text-gray-600 dark:text-gray-400';
            return (
              <span key={`old-${index}`} className={className}>
                {part.value}
              </span>
            );
          })}
          {!oldString && <span className="text-gray-400 italic">Empty</span>}
        </div>
        {/* Right Side (New) */}
        <div className="font-mono text-sm whitespace-pre-wrap break-all overflow-x-auto p-4 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-800">
          {diffResult.map((part, index) => {
            if (part.removed) return null; // Don't show removed in new side
            const className = part.added ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' : 'text-gray-600 dark:text-gray-400';
            return (
              <span key={`new-${index}`} className={className}>
                {part.value}
              </span>
            );
          })}
          {!newString && <span className="text-gray-400 italic">Empty</span>}
        </div>
      </div>
    );
  }

  // Inline View
  return (
    <div className="font-mono text-sm whitespace-pre-wrap break-all overflow-x-auto p-4 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-800">
      {diffResult.map((part, index) => {
        let className = 'text-gray-600 dark:text-gray-400';
        if (part.added) className = 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200';
        if (part.removed) className = 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 line-through';
        return (
          <span key={`inline-${index}`} className={className}>
            {part.value}
          </span>
        );
      })}
      {(!oldString && !newString) && <span className="text-gray-400 italic">No differences to display</span>}
    </div>
  );
};
