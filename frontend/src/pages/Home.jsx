import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SessionCard } from '../components/SessionCard';
import { useAuth } from '../contexts/AuthContext';
import { userApi } from '../api/userApi';
import { SocialFeed } from '../components/SocialFeed';

// Map GameStatus to SessionCard result type
const statusToResult = {
  COMPLETED: 'victory',
  ABANDONED: 'defeat',
  PLAYING: 'progress',
  BACKLOG: 'progress',
  PAUSED: 'progress',
  WISHLIST: 'progress',
};

// Map GameStatus to human-friendly label
const statusLabel = {
  COMPLETED: 'COMPLETED',
  ABANDONED: 'DROPPED',
  PLAYING: 'PLAYING',
  BACKLOG: 'BACKLOG',
  PAUSED: 'PAUSED',
  WISHLIST: 'WISHLIST',
};

// Format date as time ago
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

export const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [feedFilter, setFeedFilter] = useState('all');

  useEffect(() => {
    const fetchLibrary = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const data = await userApi.getUserLibrary(user.id);
        setGames(data.games || []);
      } catch (err) {
        console.error('Failed to fetch library:', err);
        setError('Failed to load your games');
      } finally {
        setLoading(false);
      }
    };
    fetchLibrary();
  }, [user]);

  // Filter games
  const filteredGames = games.filter((g) => {
    if (filter === 'completed') return g.status === 'COMPLETED';
    if (filter === 'playing') return g.status === 'PLAYING';
    if (filter === 'backlog') return g.status === 'BACKLOG';
    return true;
  });

  // Sort by most recently updated
  const sortedGames = [...filteredGames].sort(
    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
  );


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
      {/* Header */}
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end border-b-4 border-primary pb-4 gap-4">
        <div>
          <h2 className="text-4xl sm:text-5xl font-bold uppercase tracking-tighter text-white">
            My Games
          </h2>
          <p className="text-primary font-bold uppercase tracking-widest mt-2 text-lg">
            YOUR LIBRARY
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-16 bg-graphite/30 rounded" />
                  <div className="h-16 bg-graphite/30 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-crimson text-6xl mb-4 block">error</span>
          <p className="text-gray-400 font-bold uppercase tracking-wider">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-primary text-navy rounded font-bold uppercase text-sm"
          >
            Retry
          </button>
        </div>
      )}

      {/* Games Grid */}
      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {sortedGames.map((userGame) => {
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
                    description={[
                      statusLabel[userGame.status],
                      ...(game.genres?.slice(0, 2) || []),
                    ].join(' • ')}
                    stats={[
                      {
                        label: 'Status',
                        value: statusLabel[userGame.status] || userGame.status,
                        color: userGame.status === 'COMPLETED' ? 'primary' : userGame.status === 'ABANDONED' ? 'crimson' : undefined,
                      },
                      {
                        label: 'Rating',
                        value: userGame.rating ? `${userGame.rating}/10` : 'N/A',
                        highlight: !!userGame.rating,
                        color: userGame.rating ? 'primary' : undefined,
                      },
                    ]}
                    footer={{
                      left: (
                        <span className="text-xs font-bold uppercase text-gray-500">
                          {game.developer || game.platforms?.join(', ') || ''}
                        </span>
                      ),
                    }}
                  />
                </div>
              );
            })}
          </div>

          {sortedGames.length === 0 && (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-graphite text-6xl mb-4 block">sports_esports</span>
              <p className="text-gray-500 font-bold uppercase tracking-wider mb-2">
                {filter === 'all' ? 'No games in your library yet' : `No ${filter} games`}
              </p>
              <p className="text-gray-600 text-sm mb-4">Start by discovering and adding games to your collection</p>
              <button
                onClick={() => navigate('/discover')}
                className="px-6 py-3 bg-primary text-navy rounded font-bold uppercase text-sm hover:bg-yellow-400 transition-colors"
              >
                Discover Games
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
