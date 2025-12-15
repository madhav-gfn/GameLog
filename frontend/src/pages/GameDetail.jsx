import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header, EmptyState } from '../components/Layout';
import { RatingStars } from '../components/RatingStars';
import { StatusBadge } from '../components/StatusBadge';
import { SessionModal } from '../components/SessionModal';
import { useStore } from '../store/gameStore';
import { MOCK_GAMES, MOCK_USER_GAMES } from '../data/mockData';

export const GameDetail = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { userGames, updateUserGame, isInWishlist, toggleWishlist } = useStore();
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('BACKLOG');
  const [rating, setRating] = useState(null);
  const [review, setReview] = useState('');

  const game = MOCK_GAMES.find((g) => g.id === gameId);
  const userGame = userGames.find((ug) => ug.gameId === gameId);
  const inWishlist = isInWishlist(gameId);

  if (!game) {
    return (
      <div>
        <Header title="Game Not Found" />
        <button
          onClick={() => navigate('/discover')}
          className="px-4 py-2 bg-retro-neon-green text-black font-bold rounded hover:bg-retro-neon-green/80 transition"
        >
          Back to Discover
        </button>
      </div>
    );
  }

  const handleAddToLibrary = () => {
    if (!userGame) {
      const newUserGame = {
        id: Math.random().toString(),
        gameId,
        userId: '1',
        status: selectedStatus,
        rating: null,
        review: '',
        startedAt: null,
        completedAt: null,
        totalHours: 0,
        sessions: 0,
      };
      updateUserGame(newUserGame.id, newUserGame);
    }
  };

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
    if (userGame) {
      updateUserGame(userGame.id, { status });
    }
  };

  const handleSaveReview = () => {
    if (userGame) {
      updateUserGame(userGame.id, { rating, review });
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="mb-8 -mx-6 -mt-6 mb-8">
        <div className="relative h-80 bg-gradient-to-b from-retro-neon-blue/20 to-retro-dark overflow-hidden">
          <img
            src={game.cover}
            alt={game.title}
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-retro-dark via-retro-dark/50 to-transparent" />

          <div className="absolute bottom-6 left-6 right-6">
            <h1 className="text-4xl font-bold text-retro-neon-green mb-3 font-pixel">
              {game.title}
            </h1>
            <div className="flex gap-3 flex-wrap items-center">
              <span className="text-gray-400">{game.releaseYear}</span>
              <RatingStars rating={game.averageRating} />
              <span className="text-xs text-gray-500">
                {game.ratingCount} ratings
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Description */}
          <div className="bg-retro-purple border border-retro-neon-blue/30 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-bold text-retro-neon-green mb-3">
              About
            </h2>
            <p className="text-gray-300 leading-relaxed">{game.description}</p>
          </div>

          {/* Genres & Platforms */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-retro-purple border border-retro-neon-magenta/30 rounded-lg p-4">
              <h3 className="text-sm font-bold text-retro-neon-magenta mb-3">
                Genres
              </h3>
              <div className="flex flex-wrap gap-2">
                {game.genres.map((genre) => (
                  <span
                    key={genre}
                    className="px-3 py-1 bg-retro-neon-magenta/20 text-retro-neon-magenta rounded text-xs"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-retro-purple border border-retro-neon-blue/30 rounded-lg p-4">
              <h3 className="text-sm font-bold text-retro-neon-blue mb-3">
                Platforms
              </h3>
              <div className="flex flex-wrap gap-2">
                {game.platforms.map((platform) => (
                  <span
                    key={platform}
                    className="px-3 py-1 bg-retro-neon-blue/20 text-retro-neon-blue rounded text-xs"
                  >
                    {platform}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Review Section */}
          {userGame && (
            <div className="bg-retro-purple border border-retro-neon-yellow/30 rounded-lg p-6">
              <h2 className="text-lg font-bold text-retro-neon-yellow mb-4">
                Your Review
              </h2>

              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  Rating
                </label>
                <RatingStars
                  rating={rating || userGame.rating}
                  onRate={setRating}
                  interactive
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  Your Thoughts
                </label>
                <textarea
                  value={review || userGame.review || ''}
                  onChange={(e) => setReview(e.target.value)}
                  className="w-full px-4 py-3 bg-retro-dark border border-retro-neon-yellow/50 rounded text-white focus:outline-none focus:border-retro-neon-yellow resize-none h-24"
                  placeholder="What did you think about this game?"
                />
              </div>

              <button
                onClick={handleSaveReview}
                className="px-4 py-2 bg-retro-neon-yellow hover:bg-retro-neon-yellow/80 text-black font-bold rounded transition"
              >
                Save Review
              </button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status */}
          {userGame ? (
            <div className="bg-retro-purple border border-retro-neon-green/30 rounded-lg p-4">
              <h3 className="text-sm font-bold text-gray-300 mb-3">Status</h3>
              <div className="space-y-2">
                {['BACKLOG', 'PLAYING', 'COMPLETED', 'DROPPED'].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    className={`w-full px-3 py-2 rounded text-sm font-bold transition ${
                      userGame.status === status
                        ? 'bg-retro-neon-green text-black'
                        : 'bg-retro-dark border border-retro-neon-green/30 text-gray-300 hover:border-retro-neon-green'
                    }`}
                  >
                    <StatusBadge status={status} />
                  </button>
                ))}
              </div>

              {/* Stats */}
              <div className="mt-6 pt-4 border-t border-retro-neon-green/30 space-y-2 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>Total Hours:</span>
                  <span className="font-mono text-retro-neon-blue">
                    {userGame.totalHours}h
                  </span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Sessions:</span>
                  <span className="font-mono text-retro-neon-green">
                    {userGame.sessions}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={handleAddToLibrary}
              className="w-full px-4 py-3 bg-retro-neon-green hover:bg-retro-neon-green/80 text-black font-bold rounded transition"
            >
              + Add to Library
            </button>
          )}

          {/* Log Session Button */}
          {userGame && (
            <button
              onClick={() => setShowSessionModal(true)}
              className="w-full px-4 py-3 bg-retro-neon-blue hover:bg-retro-neon-blue/80 text-black font-bold rounded transition"
            >
              ⏱️ Log Session
            </button>
          )}

          {/* Wishlist Button */}
          <button
            onClick={() => toggleWishlist(gameId)}
            className={`w-full px-4 py-3 font-bold rounded transition ${
              inWishlist
                ? 'bg-retro-neon-magenta hover:bg-retro-neon-magenta/80 text-black'
                : 'bg-retro-dark border border-retro-neon-magenta/50 text-retro-neon-magenta hover:border-retro-neon-magenta'
            }`}
          >
            {inWishlist ? '❤️ In Wishlist' : '🤍 Add to Wishlist'}
          </button>
        </div>
      </div>

      {/* Session Modal */}
      <SessionModal
        game={game}
        isOpen={showSessionModal}
        onClose={() => setShowSessionModal(false)}
      />
    </div>
  );
};
