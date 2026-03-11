import React from 'react';

const STATUS_COLORS = {
  BACKLOG: 'bg-blue-900/30 text-blue-400 border border-blue-700',
  PLAYING: 'bg-green-900/30 text-green-400 border border-green-700',
  COMPLETED: 'bg-primary/20 text-primary border border-primary/40',
  ABANDONED: 'bg-crimson/20 text-crimson border border-crimson/40',
  PAUSED: 'bg-yellow-900/30 text-yellow-400 border border-yellow-700',
  WISHLIST: 'bg-purple-900/30 text-purple-400 border border-purple-700',
};

const STATUS_LABELS = {
  BACKLOG: 'Backlog',
  PLAYING: 'Playing',
  COMPLETED: 'Completed',
  ABANDONED: 'Dropped',
  PAUSED: 'Paused',
  WISHLIST: 'Wishlist',
};

export const StatusBadge = ({ status, className = '' }) => {
  return (
    <span
      className={`inline-block px-3 py-1 rounded text-xs font-bold uppercase tracking-wider ${STATUS_COLORS[status] || STATUS_COLORS.BACKLOG} ${className}`}
    >
      {STATUS_LABELS[status] || status}
    </span>
  );
};
