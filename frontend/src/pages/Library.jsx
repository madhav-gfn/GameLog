import React, { useState } from 'react';
import { Header, EmptyState } from '../components/Layout';
import { GameCard } from '../components/GameCard';
import { StatusBadge } from '../components/StatusBadge';
import { useStore } from '../store/gameStore';
import { MOCK_GAMES } from '../data/mockData';

export const Library = () => {
  const { userGames } = useStore();
  const [activeTab, setActiveTab] = useState('PLAYING');

  const tabs = [
    { value: 'PLAYING', label: '🎮 Playing' },
    { value: 'COMPLETED', label: '🏆 Completed' },
    { value: 'BACKLOG', label: '📝 Backlog' },
    { value: 'DROPPED', label: '❌ Dropped' },
    { value: 'WISHLIST', label: '🤍 Wishlist' },
  ];

  const getGamesForTab = () => {
    if (activeTab === 'WISHLIST') {
      return MOCK_GAMES.filter((g) => userGames.some((ug) => ug.gameId === g.id));
    }
    return userGames
      .filter((ug) => ug.status === activeTab)
      .map((ug) => MOCK_GAMES.find((g) => g.id === ug.gameId))
      .filter(Boolean);
  };

  const gamesInTab = getGamesForTab();

  return (
    <div>
      <Header
        title="My Library"
        subtitle="Track and manage your game collection"
      />

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 rounded font-bold whitespace-nowrap transition ${
              activeTab === tab.value
                ? 'bg-retro-neon-green text-black'
                : 'bg-retro-purple border border-retro-neon-green/30 text-gray-300 hover:border-retro-neon-green'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {gamesInTab.length > 0 ? (
        <div className="space-y-4">
          {gamesInTab.map((game) => {
            const userGame = userGames.find((ug) => ug.gameId === game.id);
            return (
              <div
                key={game.id}
                className="flex gap-4 bg-retro-purple border border-retro-neon-blue/30 rounded-lg p-4 hover:border-retro-neon-blue/60 transition"
              >
                {/* Cover */}
                <div className="w-24 h-32 flex-shrink-0 rounded overflow-hidden">
                  <img
                    src={game.cover}
                    alt={game.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-retro-neon-green text-lg">
                        {game.title}
                      </h3>
                      <p className="text-sm text-gray-400">{game.releaseYear}</p>
                    </div>
                    {userGame && (
                      <StatusBadge status={userGame.status} />
                    )}
                  </div>

                  <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                    {game.description}
                  </p>

                  {/* Stats */}
                  {userGame && (
                    <div className="flex gap-4 text-xs text-gray-400 font-mono">
                      <span>⏱️ {userGame.totalHours}h</span>
                      <span>📊 {userGame.sessions} sessions</span>
                      {userGame.rating && (
                        <span>⭐ {userGame.rating}/5</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
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
