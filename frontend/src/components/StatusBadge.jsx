import React from 'react';

const STATUS_COLORS = {
  BACKLOG: 'bg-blue-900/30 text-retro-neon-blue border border-retro-neon-blue/50',
  PLAYING: 'bg-green-900/30 text-retro-neon-green border border-retro-neon-green/50',
  COMPLETED: 'bg-purple-900/30 text-retro-neon-magenta border border-retro-neon-magenta/50',
  DROPPED: 'bg-red-900/30 text-red-400 border border-red-500/50',
  PAUSED: 'bg-yellow-900/30 text-retro-neon-yellow border border-retro-neon-yellow/50',
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
      className={`inline-block px-3 py-1 rounded text-xs font-mono font-bold ${
        STATUS_COLORS[status] || STATUS_COLORS.BACKLOG
      } ${className}`}
    >
      {STATUS_LABELS[status] || status}
    </span>
  );
};
