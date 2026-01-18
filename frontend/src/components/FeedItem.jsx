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
    <div className="card card-hover p-4 border border-light-border-default dark:border-dark-border-default">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="text-3xl flex-shrink-0">{activity.avatar}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-light-accent-primary dark:text-dark-accent-primary text-sm">
              {activity.username}
            </span>
            <span className="text-yellow-500 dark:text-yellow-400">{getActivityIcon(activity.type)}</span>
            <span className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary ml-auto">
              {formatTime(activity.timestamp)}
            </span>
          </div>

          <p className="text-sm text-light-text-primary dark:text-dark-text-primary mb-2">
            <span className="text-light-accent-secondary dark:text-dark-accent-secondary font-semibold">{activity.gameName}</span>
            {' '}
            <span className="text-light-text-secondary dark:text-dark-text-secondary">{activity.description}</span>
          </p>

          {/* Session Details */}
          {activity.type === 'SESSION' && activity.duration && (
            <div className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary mb-2">
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
