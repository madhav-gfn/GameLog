import React from 'react';

const STATUS_COLORS = {
  BACKLOG: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-700',
  PLAYING: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-700',
  COMPLETED: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700',
  DROPPED: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-700',
  PAUSED: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-300 dark:border-yellow-700',
};

const STATUS_LABELS = {
  BACKLOG: 'Backlog',
  PLAYING: 'Playing',
  COMPLETED: 'Completed',
  DROPPED: 'Dropped',
  PAUSED: 'Paused',
};

export const StatusBadge = ({ status, className = '' }) => {
  return (
    <span
      className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold ${
        STATUS_COLORS[status] || STATUS_COLORS.BACKLOG
      } ${className}`}
    >
      {STATUS_LABELS[status] || status}
    </span>
  );
};
