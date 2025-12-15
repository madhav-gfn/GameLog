import React from 'react';

export const LoadingSkeleton = ({ count = 3 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-retro-purple border border-retro-neon-blue/30 rounded-lg p-4 animate-pulse"
        >
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-gray-600 rounded-full flex-shrink-0" />
            <div className="flex-1">
              <div className="h-4 bg-gray-600 rounded w-1/4 mb-2" />
              <div className="h-3 bg-gray-600 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-600 rounded w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
};
