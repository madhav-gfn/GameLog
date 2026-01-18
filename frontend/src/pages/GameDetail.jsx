import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header, EmptyState, LoadingSkeleton } from '../components/Layout';
import { RatingStars } from '../components/RatingStars';
import { StatusBadge } from '../components/StatusBadge';
import { SessionModal } from '../components/SessionModal';
import { gameApi } from '../api/gameApi';
import { useAuth } from '../contexts/AuthContext';

export const GameDetail = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [game, setGame] = useState(null);
  const [userGame, setUserGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('BACKLOG');
  const [rating, setRating] = useState(null);
  const [review, setReview] = useState('');

  useEffect(() => {
    const fetchGameDetail = async () => {
      try {
        setLoading(true);
        const gameData = await gameApi.getGameDetail(gameId);
        setGame(gameData);

        if (user && user.id) {
          const libraryResponse = await fetch(`http://localhost:5000/api/users/${user.id}/library`, {
            credentials: 'include',
          });
          if (libraryResponse.ok) {
            const libraryData = await libraryResponse.json();
            const userGameData = libraryData.find((g) => g.gameId === gameId);
            setUserGame(userGameData || null);
          }
        }
        setError(null);
      } catch (err) {
        console.error('Failed to fetch game detail:', err);
        setError('Failed to load game details');
      } finally {
        setLoading(false);
      }
    };

    fetchGameDetail();
  }, [gameId, user]);

  const handleAddToLibrary = async () => {
    if (!userGame && user && user.id) {
      try {
        const response = await fetch(`http://localhost:5000/api/games/${gameId}/library`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ status: selectedStatus }),
        });
        if (response.ok) {
          const data = await response.json();
          setUserGame(data);
        }
      } catch (err) {
        console.error('Failed to add to library:', err);
      }
    }
  };

  const handleStatusChange = async (status) => {
    setSelectedStatus(status);
    if (userGame) {
      try {
        const response = await fetch(`http://localhost:5000/api/games/${gameId}/library`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ status }),
        });
        if (response.ok) {
          const data = await response.json();
          setUserGame(data);
        }
      } catch (err) {
        console.error('Failed to update status:', err);
      }
    }
  };

  const handleSaveReview = async () => {
    if (userGame) {
      try {
        const response = await fetch(`http://localhost:5000/api/games/${gameId}/library`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ rating, review }),
        });
        if (response.ok) {
          const data = await response.json();
          setUserGame(data);
        }
      } catch (err) {
        console.error('Failed to save review:', err);
      }
    }
  };

  if (loading) {
    return (
      <div>
        <Header title="Loading..." />
        <LoadingSkeleton />
      </div>
    );
  }

  if (error || !game) {
    return (
      <div>
        <Header 
          title="Game Not Found" 
          subtitle={error || "The game you're looking for doesn't exist or couldn't be loaded."}
        />
        <div className="flex gap-4 mt-6">
          <button
            onClick={() => navigate('/discover')}
            className="px-4 py-2 bg-light-accent-primary dark:bg-dark-accent-primary text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            Back to Discover
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-light-bg-card dark:bg-dark-bg-card border border-light-border-default dark:border-dark-border-default text-light-text-primary dark:text-dark-text-primary font-semibold rounded-lg hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <div className="mb-8 -mx-4 sm:-mx-6 -mt-8">
        <div className="relative h-80 bg-light-bg-secondary dark:bg-dark-bg-secondary overflow-hidden rounded-lg">
          <img
            src={game.cover}
            alt={game.title}
            className="w-full h-full object-cover opacity-40 dark:opacity-30"
            onError={(e) => {
              e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="320"%3E%3Crect fill="%23E5E5E5" width="800" height="320"/%3E%3C/svg%3E';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-light-bg-primary dark:from-dark-bg-primary via-light-bg-primary/80 dark:via-dark-bg-primary/80 to-transparent" />

          <div className="absolute bottom-6 left-6 right-6">
            <h1 className="text-4xl font-bold text-light-text-primary dark:text-dark-text-primary mb-3">
              {game.title}
            </h1>
            <div className="flex gap-3 flex-wrap items-center">
              {game.releaseYear && (
                <span className="text-light-text-secondary dark:text-dark-text-secondary">{game.releaseYear}</span>
              )}
              <RatingStars rating={game.averageRating} />
              {game.ratingCount && (
                <span className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
                  {game.ratingCount} ratings
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Description */}
          <div className="card p-6 mb-6">
            <h2 className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary mb-3">
              About
            </h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">{game.description || 'No description available.'}</p>
          </div>

          {/* Genres & Platforms */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            {game.genres && game.genres.length > 0 && (
              <div className="card p-4">
                <h3 className="text-sm font-semibold text-light-accent-secondary dark:text-dark-accent-secondary mb-3">
                  Genres
                </h3>
                <div className="flex flex-wrap gap-2">
                  {game.genres.map((genre) => (
                    <span
                      key={genre}
                      className="px-3 py-1 bg-light-accent-secondary/10 dark:bg-dark-accent-secondary/20 text-light-accent-secondary dark:text-dark-accent-secondary rounded text-xs"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {game.platforms && game.platforms.length > 0 && (
              <div className="card p-4">
                <h3 className="text-sm font-semibold text-light-accent-primary dark:text-dark-accent-primary mb-3">
                  Platforms
                </h3>
                <div className="flex flex-wrap gap-2">
                  {game.platforms.map((platform) => (
                    <span
                      key={platform}
                      className="px-3 py-1 bg-light-accent-primary/10 dark:bg-dark-accent-primary/20 text-light-accent-primary dark:text-dark-accent-primary rounded text-xs"
                    >
                      {platform}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Review Section */}
          {userGame && (
            <div className="card p-6">
              <h2 className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary mb-4">
                Your Review
              </h2>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
                  Rating
                </label>
                <RatingStars
                  rating={rating || userGame.rating}
                  onRate={setRating}
                  interactive
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
                  Your Thoughts
                </label>
                <textarea
                  value={review || userGame.review || ''}
                  onChange={(e) => setReview(e.target.value)}
                  className="w-full px-4 py-3 bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border-default dark:border-dark-border-default rounded-lg text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:border-light-accent-primary dark:focus:border-dark-accent-primary resize-none h-24"
                  placeholder="What did you think about this game?"
                />
              </div>

              <button
                onClick={handleSaveReview}
                className="px-4 py-2 bg-light-accent-primary dark:bg-dark-accent-primary text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
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
            <div className="card p-4">
              <h3 className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-3">Status</h3>
              <div className="space-y-2">
                {['BACKLOG', 'PLAYING', 'COMPLETED', 'DROPPED'].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      userGame.status === status
                        ? 'bg-light-accent-primary dark:bg-dark-accent-primary text-white'
                        : 'bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border-default dark:border-dark-border-default text-light-text-primary dark:text-dark-text-primary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover'
                    }`}
                  >
                    <StatusBadge status={status} />
                  </button>
                ))}
              </div>

              {/* Stats */}
              <div className="mt-6 pt-4 border-t border-light-border-default dark:border-dark-border-default space-y-2 text-sm">
                <div className="flex justify-between text-light-text-secondary dark:text-dark-text-secondary">
                  <span>Total Hours:</span>
                  <span className="font-semibold text-light-accent-primary dark:text-dark-accent-primary">
                    {userGame.totalHours || 0}h
                  </span>
                </div>
                <div className="flex justify-between text-light-text-secondary dark:text-dark-text-secondary">
                  <span>Sessions:</span>
                  <span className="font-semibold text-light-accent-secondary dark:text-dark-accent-secondary">
                    {userGame.sessions || 0}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={handleAddToLibrary}
              className="w-full px-4 py-3 bg-light-accent-primary dark:bg-dark-accent-primary text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              + Add to Library
            </button>
          )}

          {/* Log Session Button */}
          {userGame && (
            <button
              onClick={() => setShowSessionModal(true)}
              className="w-full px-4 py-3 bg-light-accent-secondary dark:bg-dark-accent-secondary text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              ⏱️ Log Session
            </button>
          )}
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
