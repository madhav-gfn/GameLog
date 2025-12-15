import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Layout';
import { GameCard } from '../components/GameCard';
import { useStore } from '../store/gameStore';
import { MOCK_GAMES } from '../data/mockData';

export const Profile = () => {
  const navigate = useNavigate();
  const { currentUser, userGames } = useStore();

  const recentGames = userGames
    .slice(-4)
    .reverse()
    .map((ug) => MOCK_GAMES.find((g) => g.id === ug.gameId))
    .filter(Boolean);

  const totalHours = userGames.reduce((sum, ug) => sum + ug.totalHours, 0);

  return (
    <div>
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-retro-neon-blue/20 to-retro-neon-magenta/20 border border-retro-neon-blue/30 rounded-lg p-8 mb-8">
        <div className="flex items-start justify-between">
          <div className="flex gap-6">
            <div className="text-7xl">{currentUser.avatar}</div>
            <div>
              <h1 className="text-3xl font-bold text-retro-neon-green font-pixel mb-2">
                {currentUser.username}
              </h1>
              <p className="text-gray-400 mb-4">{currentUser.bio}</p>
              <div className="flex gap-6 text-sm">
                <div>
                  <span className="font-bold text-retro-neon-blue">
                    {currentUser.followers}
                  </span>
                  <span className="text-gray-400 ml-2">followers</span>
                </div>
                <div>
                  <span className="font-bold text-retro-neon-magenta">
                    {currentUser.following}
                  </span>
                  <span className="text-gray-400 ml-2">following</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-12">
        <div className="bg-retro-purple border border-retro-neon-green/30 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-retro-neon-green font-mono">
            {totalHours}
          </div>
          <div className="text-xs text-gray-400 mt-1">Total Hours</div>
        </div>

        <div className="bg-retro-purple border border-retro-neon-blue/30 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-retro-neon-blue font-mono">
            {userGames.length}
          </div>
          <div className="text-xs text-gray-400 mt-1">Games Tracked</div>
        </div>

        <div className="bg-retro-purple border border-retro-neon-magenta/30 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-retro-neon-magenta font-mono">
            {userGames.filter((ug) => ug.status === 'COMPLETED').length}
          </div>
          <div className="text-xs text-gray-400 mt-1">Completed</div>
        </div>
      </div>

      {/* Favorite Genres */}
      <div className="bg-retro-purple border border-retro-neon-yellow/30 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-bold text-retro-neon-yellow mb-4">
          Favorite Genres
        </h2>
        <div className="flex flex-wrap gap-2">
          {currentUser.favoriteGenres.map((genre) => (
            <span
              key={genre}
              className="px-4 py-2 bg-retro-neon-yellow/20 text-retro-neon-yellow rounded-lg font-bold text-sm"
            >
              {genre}
            </span>
          ))}
        </div>
      </div>

      {/* Recently Played */}
      <div>
        <h2 className="text-2xl font-bold text-retro-neon-green mb-6">
          Recently Played
        </h2>
        {recentGames.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                compact
                onClick={() => navigate(`/game/${game.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            No games played yet. Start tracking your games!
          </div>
        )}
      </div>
    </div>
  );
};
