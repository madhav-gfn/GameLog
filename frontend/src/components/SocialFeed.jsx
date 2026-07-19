import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion as Motion, useReducedMotion } from '../utils/motionCompat';
import { useFollow } from '../hooks/useFollow';
import { FeedCard } from './FeedCard';
import { feedCardVariants, getTransition } from './animations/variants';

const PAGE_LIMIT = 8;

export const SocialFeed = ({ filter = 'all' }) => {
  const { feed, feedPagination, fetchFeed, toggleFeedReviewLike, loading, error } = useFollow();
  const [loadingMore, setLoadingMore] = useState(false);
  const reduceMotion = useReducedMotion();
  const loadMoreRef = useRef(null);

  useEffect(() => {
    fetchFeed({ page: 1, limit: PAGE_LIMIT });
  }, [fetchFeed]);

  const filteredActivities = useMemo(() => {
    const normalizedFilter = filter.toLowerCase();

    if (normalizedFilter === 'popular') {
      return [...feed].sort((a, b) => {
        const scoreA = (a.likeCount || 0) + (a.rating || 0);
        const scoreB = (b.likeCount || 0) + (b.rating || 0);
        if (scoreA !== scoreB) return scoreB - scoreA;
        return new Date(b.timestamp) - new Date(a.timestamp);
      });
    }

    return feed;
  }, [feed, filter]);

  const hasMore = feedPagination.page < feedPagination.pages;

  useEffect(() => {
    if (!loadMoreRef.current || !hasMore) return;

    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting || loading || loadingMore) return;
        setLoadingMore(true);
        try {
          await fetchFeed({
            page: feedPagination.page + 1,
            limit: feedPagination.limit || PAGE_LIMIT,
            append: true,
          });
        } finally {
          setLoadingMore(false);
        }
      },
      { rootMargin: '240px' }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [fetchFeed, feedPagination.page, feedPagination.limit, hasMore, loading, loadingMore]);

  if (loading && feed.length === 0) return <div className="text-center py-8 text-light-text-secondary dark:text-dark-text-secondary">Loading activity feed...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Failed to load feed</div>;
  if (filteredActivities.length === 0) {
    return (
      <div className="text-center py-10 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-xl">
        <span className="text-3xl mb-3 block">🎮</span>
        <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">No activity yet</h3>
        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Follow gamers to populate your feed.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredActivities.map((activity, index) => (
        <Motion.div
          key={`${activity.type}-${activity.id}`}
          variants={feedCardVariants}
          initial="hidden"
          animate="visible"
          transition={{ ...getTransition(reduceMotion, 'feedEntry'), delay: reduceMotion ? 0 : index * 0.04 }}
        >
          <FeedCard item={activity} onToggleLike={toggleFeedReviewLike} />
        </Motion.div>
      ))}

      <div ref={loadMoreRef} className="h-2" aria-hidden />
      {loadingMore && <p className="text-center text-xs text-gray-400">Loading more activities...</p>}
      {!hasMore && <p className="text-center text-xs text-gray-500">You&apos;re all caught up.</p>}
    </div>
  );
};
