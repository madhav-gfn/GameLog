import React, { useEffect } from 'react';
import { useFollow } from '../hooks/useFollow';
import { RatingStars } from './RatingStars';

export const SocialFeed = () => {
    const { feed, fetchFeed, loading, error } = useFollow();

    useEffect(() => {
        fetchFeed();
    }, [fetchFeed]);

    // Filter to only show reviews
    const reviews = feed.filter(a => a.type === 'REVIEW');

    if (loading) return (
        <div className="text-center py-8 text-light-text-secondary dark:text-dark-text-secondary">
            Loading reviews...
        </div>
    );

    if (error) return (
        <div className="text-center py-8 text-red-500">
            Failed to load feed
        </div>
    );

    if (reviews.length === 0) return (
        <div className="text-center py-10 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-xl">
            <span className="text-3xl mb-3 block">📝</span>
            <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
                No reviews yet
            </h3>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                Follow gamers to see their reviews here!
            </p>
        </div>
    );

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary">
                Recent Reviews
            </h3>
            {reviews.map((activity) => (
                <div
                    key={activity.id}
                    className="card p-4 transition-transform hover:scale-[1.01]"
                >
                    {/* Header: User + Date */}
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-full bg-light-accent-primary dark:bg-dark-accent-primary flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {activity.user.avatar ? (
                                <img src={activity.user.avatar} alt={activity.user.username} className="w-full h-full rounded-full object-cover" />
                            ) : (
                                activity.user.username[0].toUpperCase()
                            )}
                        </div>
                        <div className="flex-grow min-w-0">
                            <span className="font-semibold text-light-text-primary dark:text-dark-text-primary text-sm">
                                {activity.user.displayName || activity.user.username}
                            </span>
                            <span className="text-light-text-tertiary dark:text-dark-text-tertiary text-xs ml-2">
                                reviewed
                            </span>
                        </div>
                        <span className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary whitespace-nowrap">
                            {formatTimeAgo(activity.createdAt)}
                        </span>
                    </div>

                    {/* Game Info */}
                    {activity.game && (
                        <div className="flex gap-3 mb-3">
                            {activity.game.coverImage && (
                                <div className="w-12 h-16 rounded overflow-hidden flex-shrink-0 shadow-sm">
                                    <img src={activity.game.coverImage} alt={activity.game.title} className="w-full h-full object-cover" />
                                </div>
                            )}
                            <div className="min-w-0">
                                <h4 className="font-semibold text-light-accent-secondary dark:text-dark-accent-secondary text-sm leading-tight">
                                    {activity.game.title}
                                </h4>
                                {activity.reviewRating && (
                                    <div className="mt-1">
                                        <RatingStars rating={activity.reviewRating} />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Review Content */}
                    {activity.reviewContent && (
                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary leading-relaxed line-clamp-3 bg-light-bg-secondary dark:bg-dark-bg-secondary p-3 rounded-lg">
                            "{activity.reviewContent}"
                        </p>
                    )}
                </div>
            ))}
        </div>
    );
};

const formatTimeAgo = (dateStr) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
};
