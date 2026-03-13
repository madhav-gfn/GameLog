import React, { useEffect } from 'react';
import { useFollow } from '../hooks/useFollow';
import { FeedCard } from './FeedCard';

export const SocialFeed = () => {
  const { feed, fetchFeed, loading, error } = useFollow();

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  const reviews = feed.filter((a) => a.type === 'REVIEW');

  if (loading) return <div className="text-center py-8 text-light-text-secondary dark:text-dark-text-secondary">Loading reviews...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Failed to load feed</div>;
  if (reviews.length === 0) {
    return (
      <div className="text-center py-10 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-xl">
        <span className="text-3xl mb-3 block">📝</span>
        <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">No reviews yet</h3>
        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Follow gamers to see their reviews here!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary">Recent Reviews</h3>
      {reviews.map((activity) => (
        <FeedCard
          key={activity.id}
          item={{
            type: 'REVIEW',
            id: activity.id,
            user: activity.user,
            game: activity.game,
            content: activity.reviewContent || activity.content,
            rating: activity.reviewRating || activity.rating,
            timestamp: activity.createdAt || activity.timestamp,
          }}
        />
      ))}
    </div>
  );
};
