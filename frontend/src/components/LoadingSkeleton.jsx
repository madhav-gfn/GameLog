import React from 'react';

export const LoadingSkeleton = ({ count = 3 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="card p-4 animate-pulse"
        >
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-full flex-shrink-0" />
            <div className="flex-1">
              <div className="h-4 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded w-1/4 mb-2" />
              <div className="h-3 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded w-3/4 mb-2" />
              <div className="h-3 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
};
