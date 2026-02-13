import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header, LoadingSkeleton } from '../components/Layout';
import { RatingStars } from '../components/RatingStars';
import { StatusBadge } from '../components/StatusBadge';
import { ReviewForm } from '../components/ReviewForm';
import { ReviewList } from '../components/ReviewList';
import { gameApi } from '../api/gameApi';
import { api } from '../api/axios';
import { useAuth } from '../contexts/AuthContext';

export const GameDetail = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [game, setGame] = useState(null);
  const [userGame, setUserGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [, setSelectedStatus] = useState('BACKLOG');

  // Screenshot lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Fetch game data
  const fetchGameData = React.useCallback(async () => {
    try {
      setLoading(true);
      const gameData = await gameApi.getGameDetail(gameId);
      setGame(gameData);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch game detail:', err);
      setError('Failed to load game details');
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  // Re-fetch when gameId changes
  useEffect(() => {
    fetchGameData();

    // Fetch user's status for this game
    if (user && user.id) {
      api.get(`/users/${user.id}/library`).then(res => {
        const games = res.games || res || [];
        const found = games.find(g => g.gameId === gameId || g.game?.rawgId === Number(gameId));
        if (found) {
          setUserGame(found);
          setSelectedStatus(found.status);
        }
      }).catch(console.error);
    }
  }, [gameId, user, fetchGameData]);

  const [libraryError, setLibraryError] = useState(null);

  const handleUpdateLibrary = async (updates) => {
    setLibraryError(null);
    if (!user) {
      setLibraryError('Please log in to add games to your library.');
      return;
    }
    try {
      const result = await gameApi.addGameToLibrary(gameId, updates);
      setUserGame(result);
      if (updates.status) setSelectedStatus(updates.status);
    } catch (err) {
      console.error('Failed to update library:', err);
      setLibraryError(err?.response?.data?.error || err.message || 'Failed to update library. Please try again.');
    }
  };

  const onReviewSubmitted = () => {
    fetchGameData();
    window.location.reload();
  };

  // Lightbox navigation
  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  const nextImage = () => {
    const images = game?.screenshots || [];
    setLightboxIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    const images = game?.screenshots || [];
    setLightboxIndex((prev) => (prev - 1 + images.length) % images.length);
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
        </div>
      </div>
    );
  }

  const screenshots = game.screenshots || [];
  const artworks = game.artworks || [];
  const videos = game.videos || [];
  const similarGames = game.similarGames || [];
  const themes = game.themes || [];
  const gameModes = game.gameModes || [];
  const companies = game.companies || [];
  const developers = companies.filter(c => c.developer);
  const publishers = companies.filter(c => c.publisher);

  return (
    <div>
      {/* Hero Section */}
      <div className="mb-8 -mx-4 sm:-mx-6 -mt-8">
        <div className="relative h-80 bg-light-bg-secondary dark:bg-dark-bg-secondary overflow-hidden rounded-lg">
          <img
            src={game.cover}
            alt={game.title}
            className="w-full h-full object-cover opacity-40 dark:opacity-30"
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
              {developers.length > 0 && (
                <span className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
                  by {developers.map(d => d.name).join(', ')}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Description / Storyline */}
          <div className="card p-6">
            <h2 className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary mb-3">
              About
            </h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">
              {game.description || 'No description available.'}
            </p>

            {/* Storyline from IGDB */}
            {game.storyline && (
              <div className="mt-4 pt-4 border-t border-light-border-default dark:border-dark-border-default">
                <h3 className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
                  Storyline
                </h3>
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">
                  {game.storyline}
                </p>
              </div>
            )}
          </div>

          {/* Screenshots Gallery */}
          {screenshots.length > 0 && (
            <div className="card p-6">
              <h2 className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary mb-4">
                Screenshots
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {screenshots.map((screenshot, index) => (
                  <button
                    key={index}
                    onClick={() => openLightbox(index)}
                    className="relative aspect-video rounded-lg overflow-hidden group cursor-pointer border border-light-border-default dark:border-dark-border-default"
                  >
                    <img
                      src={screenshot.url}
                      alt={`Screenshot ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-xl">🔍</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Videos / Trailers */}
          {videos.length > 0 && (
            <div className="card p-6">
              <h2 className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary mb-4">
                Videos & Trailers
              </h2>
              <div className="space-y-4">
                {videos.slice(0, 3).map((video, index) => (
                  <div key={index}>
                    {video.name && (
                      <h3 className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
                        {video.name}
                      </h3>
                    )}
                    <div className="relative aspect-video rounded-lg overflow-hidden border border-light-border-default dark:border-dark-border-default">
                      <iframe
                        src={video.embedUrl}
                        title={video.name || `Trailer ${index + 1}`}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Similar Games */}
          {similarGames.length > 0 && (
            <div className="card p-6">
              <h2 className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary mb-4">
                Similar Games
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {similarGames.slice(0, 8).map((sg, index) => (
                  <div
                    key={index}
                    className="group cursor-pointer"
                    onClick={() => {
                      // Navigate to IGDB game — we'd need to search by name
                      // For now, just show the card
                    }}
                  >
                    <div className="relative aspect-[3/4] rounded-lg overflow-hidden border border-light-border-default dark:border-dark-border-default bg-light-bg-secondary dark:bg-dark-bg-secondary">
                      {sg.cover ? (
                        <img
                          src={sg.cover}
                          alt={sg.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-light-text-tertiary dark:text-dark-text-tertiary text-xs text-center p-2">
                          No Cover
                        </div>
                      )}
                    </div>
                    <p className="mt-2 text-xs font-semibold text-light-text-primary dark:text-dark-text-primary truncate group-hover:text-light-accent-primary dark:group-hover:text-dark-accent-primary transition-colors">
                      {sg.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Artworks */}
          {artworks.length > 0 && (
            <div className="card p-6">
              <h2 className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary mb-4">
                Artworks
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {artworks.map((artwork, index) => (
                  <div
                    key={index}
                    className="relative aspect-video rounded-lg overflow-hidden border border-light-border-default dark:border-dark-border-default"
                  >
                    <img
                      src={artwork.url}
                      alt={`Artwork ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews Section */}
          <div className="card p-6">
            <h2 className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary mb-4">Reviews</h2>
            {user ? (
              <div className="mb-8">
                <ReviewForm gameId={game.id} onReviewSubmitted={onReviewSubmitted} />
              </div>
            ) : (
              <div className="mb-8 p-4 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded text-center">
                <p>Log in to write a review!</p>
              </div>
            )}
            <ReviewList gameId={game.id} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status */}
          {userGame ? (
            <div className="card p-4">
              <h3 className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-3">Status</h3>
              <div className="space-y-2">
                {['BACKLOG', 'PLAYING', 'COMPLETED', 'ABANDONED'].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleUpdateLibrary({ status })}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${userGame.status === status
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
              </div>
            </div>
          ) : (
            <button
              onClick={() => handleUpdateLibrary({ status: 'BACKLOG' })}
              className="w-full px-4 py-3 bg-light-accent-primary dark:bg-dark-accent-primary text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              + Add to Library
            </button>
          )}

          {/* Library Error */}
          {libraryError && (
            <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300 text-sm">
              {libraryError}
            </div>
          )}

          {/* Game Info Sidebar */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-3">
              Game Info
            </h3>
            <div className="space-y-3 text-sm">
              {/* Genres */}
              {game.genres && game.genres.length > 0 && (
                <div>
                  <span className="text-light-text-tertiary dark:text-dark-text-tertiary block mb-1">Genres</span>
                  <div className="flex gap-1 flex-wrap">
                    {game.genres.map((genre) => (
                      <span
                        key={genre}
                        className="text-xs px-2 py-1 bg-light-accent-secondary/10 dark:bg-dark-accent-secondary/20 text-light-accent-secondary dark:text-dark-accent-secondary rounded"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Platforms */}
              {game.platforms && game.platforms.length > 0 && (
                <div>
                  <span className="text-light-text-tertiary dark:text-dark-text-tertiary block mb-1">Platforms</span>
                  <div className="flex gap-1 flex-wrap">
                    {game.platforms.map((platform) => (
                      <span
                        key={platform}
                        className="text-xs px-2 py-1 bg-light-accent-primary/10 dark:bg-dark-accent-primary/20 text-light-accent-primary dark:text-dark-accent-primary rounded border border-light-accent-primary/20 dark:border-dark-accent-primary/30"
                      >
                        {platform}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Themes (from IGDB) */}
              {themes.length > 0 && (
                <div>
                  <span className="text-light-text-tertiary dark:text-dark-text-tertiary block mb-1">Themes</span>
                  <div className="flex gap-1 flex-wrap">
                    {themes.map((theme) => (
                      <span
                        key={theme}
                        className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded"
                      >
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Game Modes (from IGDB) */}
              {gameModes.length > 0 && (
                <div>
                  <span className="text-light-text-tertiary dark:text-dark-text-tertiary block mb-1">Game Modes</span>
                  <div className="flex gap-1 flex-wrap">
                    {gameModes.map((mode) => (
                      <span
                        key={mode}
                        className="text-xs px-2 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded"
                      >
                        {mode}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Developer / Publisher */}
              {developers.length > 0 && (
                <div>
                  <span className="text-light-text-tertiary dark:text-dark-text-tertiary block mb-1">Developer</span>
                  <span className="text-light-text-primary dark:text-dark-text-primary">
                    {developers.map(d => d.name).join(', ')}
                  </span>
                </div>
              )}

              {publishers.length > 0 && (
                <div>
                  <span className="text-light-text-tertiary dark:text-dark-text-tertiary block mb-1">Publisher</span>
                  <span className="text-light-text-primary dark:text-dark-text-primary">
                    {publishers.map(p => p.name).join(', ')}
                  </span>
                </div>
              )}

              {/* Fallback developer/publisher from RAWG if IGDB companies empty */}
              {developers.length === 0 && game.developer && (
                <div>
                  <span className="text-light-text-tertiary dark:text-dark-text-tertiary block mb-1">Developer</span>
                  <span className="text-light-text-primary dark:text-dark-text-primary">{game.developer}</span>
                </div>
              )}

              {publishers.length === 0 && game.publisher && (
                <div>
                  <span className="text-light-text-tertiary dark:text-dark-text-tertiary block mb-1">Publisher</span>
                  <span className="text-light-text-primary dark:text-dark-text-primary">{game.publisher}</span>
                </div>
              )}

              {/* Metacritic */}
              {game.metacriticScore && (
                <div>
                  <span className="text-light-text-tertiary dark:text-dark-text-tertiary block mb-1">Metacritic</span>
                  <span className={`text-sm font-bold px-2 py-1 rounded ${game.metacriticScore >= 75 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                      game.metacriticScore >= 50 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                        'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    }`}>
                    {game.metacriticScore}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Screenshot Lightbox */}
      {lightboxOpen && screenshots.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button
            className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300 transition-colors z-10"
            onClick={closeLightbox}
          >
            ✕
          </button>

          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-4xl hover:text-gray-300 transition-colors z-10"
            onClick={(e) => { e.stopPropagation(); prevImage(); }}
          >
            ‹
          </button>

          <img
            src={screenshots[lightboxIndex]?.urlHD || screenshots[lightboxIndex]?.url}
            alt={`Screenshot ${lightboxIndex + 1}`}
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />

          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-4xl hover:text-gray-300 transition-colors z-10"
            onClick={(e) => { e.stopPropagation(); nextImage(); }}
          >
            ›
          </button>

          <div className="absolute bottom-4 text-white text-sm">
            {lightboxIndex + 1} / {screenshots.length}
          </div>
        </div>
      )}
    </div>
  );
};
