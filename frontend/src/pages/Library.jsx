import React, { useState, useEffect } from 'react';
import { Header, EmptyState, LoadingSkeleton } from '../components/Layout';
import { GameCard } from '../components/GameCard';
import { StatusBadge } from '../components/StatusBadge';
import { gameApi } from '../api/gameApi';
import { useAuth } from '../contexts/AuthContext';

export const Library = () => {
  const { user } = useAuth();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('PLAYING');

  useEffect(() => {
    const fetchUserLibrary = async () => {
      if (!user || !user.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/users/${user.id}/library`, {
          credentials: 'include',
        });
        if (!response.ok) throw new Error('Failed to fetch library');
        const data = await response.json();
        // Backend returns { games: [], pagination: {} }
        setGames(data.games || data || []);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch library:', err);
        setError('Failed to load your library');
        setGames([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserLibrary();
  }, [user]);

  const tabs = [
    { value: 'PLAYING', label: '🎮 Playing' },
    { value: 'COMPLETED', label: '🏆 Completed' },
    { value: 'BACKLOG', label: '📝 Backlog' },
    { value: 'DROPPED', label: '❌ Dropped' },
    { value: 'WISHLIST', label: '🤍 Wishlist' },
  ];

  const getGamesForTab = () => {
    if (!Array.isArray(games)) return [];
    return games.filter((g) => g.status === activeTab);
  };

  const gamesInTab = getGamesForTab();

  if (loading) {
    return (
      <div>
        <Header
          title="My Library"
          subtitle="Track and manage your game collection"
        />
        <div className="space-y-4">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header
          title="My Library"
          subtitle="Track and manage your game collection"
        />
        <EmptyState
          icon="⚠️"
          title="Error loading library"
          description={error}
        />
      </div>
    );
  }

  return (
    <div>
      <Header
        title="My Library"
        subtitle="Track and manage your game collection"
      />

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors ${
              activeTab === tab.value
                ? 'bg-light-accent-primary dark:bg-dark-accent-primary text-white'
                : 'bg-light-bg-card dark:bg-dark-bg-card border border-light-border-default dark:border-dark-border-default text-light-text-primary dark:text-dark-text-primary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {gamesInTab.length > 0 ? (
        <div className="space-y-4">
          {gamesInTab.map((game) => (
            <div
              key={game.id}
              className="flex gap-4 card card-hover p-4"
            >
              {/* Cover */}
              <div className="w-24 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-light-bg-secondary dark:bg-dark-bg-secondary">
                <img
                  src={game.cover || game.coverImage}
                  alt={game.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="96" height="128"%3E%3Crect fill="%23E5E5E5" width="96" height="128"/%3E%3C/svg%3E';
                  }}
                />
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-light-text-primary dark:text-dark-text-primary text-lg">
                      {game.title}
                    </h3>
                    {game.releaseYear && (
                      <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">{game.releaseYear}</p>
                    )}
                  </div>
                  {game.status && (
                    <StatusBadge status={game.status} />
                  )}
                </div>

                {game.description && (
                  <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-3 line-clamp-2">
                    {game.description}
                  </p>
                )}

                {/* Stats */}
                {game && (
                  <div className="flex gap-4 text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
                    <span>⏱️ {game.totalHours || 0}h</span>
                    <span>📊 {game.sessions || 0} sessions</span>
                    {game.rating && (
                      <span>⭐ {game.rating}/5</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={
            activeTab === 'PLAYING'
              ? '🎮'
              : activeTab === 'COMPLETED'
                ? '🏆'
                : activeTab === 'WISHLIST'
                  ? '🤍'
                  : '📝'
          }
          title="No games here yet"
          description={
            activeTab === 'WISHLIST'
              ? 'Add games to your wishlist from the discover page.'
              : `Start playing or add games to your ${activeTab.toLowerCase()}`
          }
        />
      )}
    </div>
  );
};
