import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion as Motion, useReducedMotion } from '../utils/motionCompat';
import { useFollow } from '../hooks/useFollow';
import { FeedCard } from './FeedCard';
import { feedCardVariants, getTransition } from './animations/variants';

const PAGE_LIMIT = 8;

const emptyStateCopyByFilter = {
  following: {
    title: 'No activity from people you follow',
    description: 'Follow more gamers to see their updates here.',
  },
  log: {
    title: 'No game logs yet',
    description: 'Log a game to get logs showing up here.',
  },
  review: {
    title: 'No reviews yet',
    description: 'Write a review to get reviews showing up here.',
  },
  default: {
    title: 'No activity yet',
    description: 'Follow gamers to populate your feed.',
  },
};

// Maps a UI filter tag to the backend query it needs. `log`/`review` and `following`
// have to be applied server-side — client-side post-filtering over the merged,
// time-sorted feed can land dozens of pages deep before finding a match if one
// activity type or one followed user's activity is chronologically clustered.
const queryForFilter = (filter) => {
  switch (filter.toLowerCase()) {
    case 'following': return { type: 'all', following: true };
    case 'log': return { type: 'log', following: false };
    case 'review': return { type: 'review', following: false };
    default: return { type: 'all', following: false };
  }
};

export const SocialFeed = ({ filter = 'all' }) => {
  const { feed, feedPagination, fetchFeed, toggleFeedReviewLike, loading, error } = useFollow();
  const [loadingMore, setLoadingMore] = useState(false);
  const reduceMotion = useReducedMotion();
  const loadMoreRef = useRef(null);

  useEffect(() => {
    fetchFeed({ page: 1, limit: PAGE_LIMIT, ...queryForFilter(filter) });
  }, [filter, fetchFeed]);

  const filteredActivities = useMemo(() => {
    if (filter.toLowerCase() === 'popular') {
      return [...feed].sort((a, b) => {
        const scoreA = (a.likeCount || 0) + (a.rating || 0);
        const scoreB = (b.likeCount || 0) + (b.rating || 0);
        if (scoreA !== scoreB) return scoreB - scoreA;
        return new Date(b.timestamp) - new Date(a.timestamp);
      });
    }

    return feed;
  }, [feed, filter]);

  const emptyStateCopy = emptyStateCopyByFilter[filter.toLowerCase()] || emptyStateCopyByFilter.default;

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
            ...queryForFilter(filter),
          });
        } finally {
          setLoadingMore(false);
        }
      },
      { rootMargin: '240px' }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [fetchFeed, feedPagination.page, feedPagination.limit, hasMore, loading, loadingMore, filter]);

  if (loading && feed.length === 0) return <div className="text-center py-8 text-gray-400">Loading activity feed...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Failed to load feed</div>;

  return (
    <div className="space-y-4">
      {filteredActivities.length === 0 ? (
        <div className="text-center py-10 bg-navy rounded-xl">
          <span className="text-3xl mb-3 block">🎮</span>
          <h3 className="text-lg font-semibold text-white mb-2">{emptyStateCopy.title}</h3>
          <p className="text-sm text-gray-400">{emptyStateCopy.description}</p>
        </div>
      ) : (
        filteredActivities.map((activity, index) => (
          <Motion.div
            key={`${activity.type}-${activity.id}`}
            variants={feedCardVariants}
            initial="hidden"
            animate="visible"
            transition={{ ...getTransition(reduceMotion, 'feedEntry'), delay: reduceMotion ? 0 : index * 0.04 }}
          >
            <FeedCard item={activity} onToggleLike={toggleFeedReviewLike} />
          </Motion.div>
        ))
      )}

      {/* Kept mounted even when the active filter matches nothing yet, so the
          observer can keep paging in fresh data until a match turns up. */}
      <div ref={loadMoreRef} className="h-2" aria-hidden />
      {loadingMore && <p className="text-center text-xs text-gray-400">Loading more activities...</p>}
      {!hasMore && filteredActivities.length > 0 && <p className="text-center text-xs text-gray-500">You&apos;re all caught up.</p>}
    </div>
  );
};
