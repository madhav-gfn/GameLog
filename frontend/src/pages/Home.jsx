import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SessionCard } from '../components/SessionCard';
import { useAuth } from '../contexts/AuthContext';
import { userApi } from '../api/userApi';
import { SocialFeed } from '../components/SocialFeed';

const statusToResult = {
  COMPLETED: 'victory',
  ABANDONED: 'defeat',
  PLAYING: 'progress',
  BACKLOG: 'progress',
  PAUSED: 'progress',
  WISHLIST: 'progress',
};

const statusLabel = {
  COMPLETED: 'COMPLETED',
  ABANDONED: 'DROPPED',
  PLAYING: 'PLAYING',
  BACKLOG: 'BACKLOG',
  PAUSED: 'PAUSED',
  WISHLIST: 'WISHLIST',
};

const FEED_PAGE_SIZE = 12;

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

const adaptFeedActivity = (activity) => {
  const game = activity.game || activity.userGame?.game || {};
  const userGame = activity.userGame || activity;
  const actor = activity.user || activity.actor || {};

  if (!game?.title && !userGame?.status) return null;

  return {
    id: activity.id || `${userGame.gameId || game.rawgId}-${activity.createdAt || userGame.updatedAt}`,
    actor: actor.username || actor.displayName || 'Player',
    actorId: actor.id,
    updatedAt: activity.createdAt || userGame.updatedAt,
    gameId: game.rawgId || userGame.gameId,
    game,
    userGame,
  };
};

export const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [feedItems, setFeedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [feedFilter, setFeedFilter] = useState('all');

  const fetchLibraryFallback = useCallback(async () => {
    if (!user?.id) return;
    const data = await userApi.getUserLibrary(user.id);
    setGames(data.games || []);
  }, [user]);

  const fetchFeed = useCallback(async (targetPage = 1, reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      const response = await followApi.getSocialFeed({ page: targetPage, limit: FEED_PAGE_SIZE, status: filter === 'all' ? undefined : filter.toUpperCase() });
      const rawItems = response.activities || response.items || response.feed || [];
      const adapted = rawItems.map(adaptFeedActivity).filter(Boolean);

      if (adapted.length === 0 && targetPage === 1) {
        setUsingFeed(false);
        await fetchLibraryFallback();
        return;
      }

      setUsingFeed(true);
      setFeedItems((prev) => (reset ? adapted : [...prev, ...adapted]));
      setHasMore(Boolean(response.hasMore) || adapted.length >= FEED_PAGE_SIZE);
      setPage(targetPage);
    } catch (err) {
      console.error('Failed to fetch social feed:', err);
      if (targetPage === 1) {
        setUsingFeed(false);
        await fetchLibraryFallback();
      } else {
        setError('Failed to load more feed activities');
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [fetchLibraryFallback, filter]);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    fetchFeed(1, true);
  }, [user, fetchFeed]);

  useEffect(() => {
    const onLogCreated = (event) => {
      const item = event.detail;
      if (!item) return;
      setFeedItems((prev) => [item, ...prev]);
      setUsingFeed(true);
    };

    window.addEventListener('gamelog:created', onLogCreated);
    return () => window.removeEventListener('gamelog:created', onLogCreated);
  }, []);


  const filteredLibraryGames = useMemo(() => games.filter((g) => {
    if (filter === 'completed') return g.status === 'COMPLETED';
    if (filter === 'playing') return g.status === 'PLAYING';
    if (filter === 'backlog') return g.status === 'BACKLOG';
    return true;
  }), [filter, games]);

  const sortedLibraryGames = useMemo(() => [...filteredLibraryGames].sort(
    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
  ), [filteredLibraryGames]);

  const visibleFeedItems = useMemo(() => {
    if (filter === 'all') return feedItems;
    return feedItems.filter((item) => item.userGame?.status === filter.toUpperCase());
  }, [feedItems, filter]);


  const socialFilterButtons = [
    { key: 'all', label: 'All' },
    { key: 'friends', label: 'Friends' },
    { key: 'following', label: 'Following' },
    { key: 'popular', label: 'Popular' },
    { key: 'platform', label: 'Platform' },
    { key: 'status', label: 'Status' },
  ];

  const filterButtons = [
    { key: 'all', label: 'ALL' },
    { key: 'playing', label: 'PLAYING' },
    { key: 'completed', label: 'COMPLETED' },
    { key: 'backlog', label: 'BACKLOG' },
  ];

  return (
    <div>
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end border-b-4 border-primary pb-4 gap-4">
        <div>
          <h2 className="text-4xl sm:text-5xl font-bold uppercase tracking-tighter text-white">
            Home Feed
          </h2>
          <p className="text-primary font-bold uppercase tracking-widest mt-2 text-lg">
            Social activity first
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {filterButtons.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded font-bold uppercase text-sm transition-colors ${filter === f.key
                ? 'bg-primary text-navy'
                : 'bg-graphite text-white hover:bg-navy'
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </header>

      <section className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
          <h3 className="text-2xl font-bold uppercase tracking-tight text-white">Social Feed</h3>
          <div className="flex flex-wrap gap-2">
            {socialFilterButtons.map((f) => (
              <button
                key={f.key}
                onClick={() => setFeedFilter(f.key)}
                className={`px-3 py-2 rounded font-bold uppercase text-xs transition-colors ${feedFilter === f.key
                  ? 'bg-primary text-navy'
                  : 'bg-graphite text-white hover:bg-navy'
                  }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <SocialFeed filter={feedFilter} />
      </section>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-navy border-2 border-graphite rounded overflow-hidden animate-pulse">
              <div className="aspect-video bg-graphite" />
              <div className="p-5 space-y-3">
                <div className="h-6 bg-graphite rounded w-2/3" />
                <div className="h-4 bg-graphite rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-crimson mb-4 text-sm font-bold uppercase">{error}</p>}

      {!loading && usingFeed && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {visibleFeedItems.map((item) => {
              const game = item.game || {};
              const userGame = item.userGame || {};
              return (
                <div key={item.id} onClick={() => navigate(`/game/${item.gameId}`)} className="cursor-pointer">
                  <SessionCard
                    title={game.title || 'Unknown Game'}
                    image={game.coverImage || game.cover || ''}
                    imageAlt={game.title || 'Game cover'}
                    result={statusToResult[userGame.status] || 'progress'}
                    timeAgo={timeAgo(item.updatedAt)}
                    platform={game.platforms?.[0] || 'PC'}
                    description={[`@${item.actor}`, statusLabel[userGame.status] || userGame.status || 'UPDATED'].join(' • ')}
                    stats={[
                      { label: 'Status', value: statusLabel[userGame.status] || userGame.status || 'UPDATED' },
                      { label: 'Rating', value: userGame.rating ? `${userGame.rating}/10` : 'N/A' },
                    ]}
                  />
                </div>
              );
            })}
          </div>

          {visibleFeedItems.length === 0 && <p className="text-gray-500 font-bold uppercase text-sm">No activities for this filter yet.</p>}

          {hasMore && (
            <div className="mt-8 text-center">
              <button
                onClick={() => fetchFeed(page + 1)}
                disabled={loadingMore}
                className="px-6 py-3 bg-primary text-navy rounded font-bold uppercase text-sm disabled:opacity-60"
              >
                {loadingMore ? 'Loading…' : 'Load more'}
              </button>
            </div>
          )}
        </>
      )}

      {!loading && !usingFeed && (
        <>
          <p className="text-gray-500 font-bold uppercase text-sm mb-4">Feed unavailable, showing your library.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {sortedLibraryGames.map((userGame) => {
              const game = userGame.game || {};
              return (
                <div key={userGame.id} onClick={() => navigate(`/game/${game.rawgId || userGame.gameId}`)} className="cursor-pointer">
                  <SessionCard
                    title={game.title || 'Unknown Game'}
                    image={game.coverImage || ''}
                    imageAlt={game.title || 'Game cover'}
                    result={statusToResult[userGame.status] || 'progress'}
                    timeAgo={timeAgo(userGame.updatedAt)}
                    platform={game.platforms?.[0] || 'PC'}
                    description={[statusLabel[userGame.status], ...(game.genres?.slice(0, 2) || [])].join(' • ')}
                    stats={[
                      { label: 'Status', value: statusLabel[userGame.status] || userGame.status },
                      { label: 'Rating', value: userGame.rating ? `${userGame.rating}/10` : 'N/A' },
                    ]}
                  />
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
