import React from 'react';
import { RatingStars } from './RatingStars';

export const FeedItem = ({ activity }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'STARTED':
        return '🎮';
      case 'SESSION':
        return '⏱️';
      case 'COMPLETED':
        return '🏆';
      case 'REVIEW':
        return '⭐';
      default:
        return '📝';
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 1) return 'now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="bg-retro-purple border border-retro-neon-green/30 rounded-lg p-4 hover:border-retro-neon-green/60 hover:shadow-neon-green/50 transition-all duration-300">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="text-3xl flex-shrink-0">{activity.avatar}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-retro-neon-blue text-sm">
              {activity.username}
            </span>
            <span className="text-retro-neon-yellow">{getActivityIcon(activity.type)}</span>
            <span className="text-xs text-gray-400 ml-auto">
              {formatTime(activity.timestamp)}
            </span>
          </div>

          <p className="text-sm text-gray-300 mb-2">
            <span className="text-retro-neon-magenta font-semibold">{activity.gameName}</span>
            {' '}
            <span className="text-gray-400">{activity.description}</span>
          </p>

          {/* Session Details */}
          {activity.type === 'SESSION' && activity.duration && (
            <div className="text-xs text-gray-400 font-mono mb-2">
              ⏱️ {Math.floor(activity.duration / 60)}h {activity.duration % 60}m
            </div>
          )}

          {/* Rating */}
          {activity.rating && (
            <div className="mt-2">
              <RatingStars rating={activity.rating} size="sm" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
