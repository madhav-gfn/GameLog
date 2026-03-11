import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header, LoadingSkeleton } from '../components/Layout';
import { RatingStars } from '../components/RatingStars';
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

  useEffect(() => {
    fetchGameData();

    if (user?.id) {
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
      setLibraryError(err?.response?.data?.error || err.message || 'Failed to update library.');
    }
  };

  const onReviewSubmitted = () => {
    fetchGameData();
    window.location.reload();
  };

  const openLightbox = (index) => { setLightboxIndex(index); setLightboxOpen(true); };
  const closeLightbox = () => setLightboxOpen(false);
  const nextImage = () => { const images = game?.screenshots || []; setLightboxIndex((prev) => (prev + 1) % images.length); };
  const prevImage = () => { const images = game?.screenshots || []; setLightboxIndex((prev) => (prev - 1 + images.length) % images.length); };

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
        <Header title="Game Not Found" subtitle={error || "The game you're looking for doesn't exist."} />
        <button
          onClick={() => navigate('/discover')}
          className="px-6 py-3 bg-primary text-navy font-bold uppercase rounded tracking-wider hover:bg-yellow-400 transition-colors"
        >
          Back to Discover
        </button>
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

  const statusButtons = ['BACKLOG', 'PLAYING', 'COMPLETED', 'ABANDONED'];

  return (
    <div>
      {/* Hero Section */}
      <div className="mb-8 -mx-8 -mt-8">
        <div className="relative h-80 bg-graphite overflow-hidden">
          <img src={game.cover} alt={game.title} className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/80 to-transparent" />
          <div className="absolute bottom-6 left-8 right-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-white uppercase tracking-tighter mb-3">
              {game.title}
            </h1>
            <div className="flex gap-3 flex-wrap items-center">
              {game.releaseYear && <span className="text-gray-400 font-bold">{game.releaseYear}</span>}
              <RatingStars rating={game.averageRating} />
              {game.ratingCount > 0 && <span className="text-xs text-gray-500">{game.ratingCount} ratings</span>}
              {developers.length > 0 && (
                <span className="text-xs text-primary font-bold uppercase">by {developers.map(d => d.name).join(', ')}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* About */}
          <div className="bg-navy border-2 border-graphite rounded p-6">
            <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-3">About</h2>
            <p className="text-gray-400 leading-relaxed">{game.description || 'No description available.'}</p>
            {game.storyline && (
              <div className="mt-4 pt-4 border-t-2 border-graphite">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Storyline</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{game.storyline}</p>
              </div>
            )}
          </div>

          {/* Screenshots */}
          {screenshots.length > 0 && (
            <div className="bg-navy border-2 border-graphite rounded p-6">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-4">Screenshots</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {screenshots.map((screenshot, index) => (
                  <button
                    key={index}
                    onClick={() => openLightbox(index)}
                    className="relative aspect-video rounded overflow-hidden group cursor-pointer border-2 border-graphite hover:border-primary transition-colors"
                  >
                    <img src={screenshot.url} alt={`Screenshot ${index + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-primary/10 transition-colors duration-300 flex items-center justify-center">
                      <span className="material-symbols-outlined opacity-0 group-hover:opacity-100 transition-opacity text-white text-xl">zoom_in</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Videos */}
          {videos.length > 0 && (
            <div className="bg-navy border-2 border-graphite rounded p-6">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-4">Videos & Trailers</h2>
              <div className="space-y-4">
                {videos.slice(0, 3).map((video, index) => (
                  <div key={index}>
                    {video.name && <h3 className="text-sm font-bold text-white uppercase mb-2">{video.name}</h3>}
                    <div className="relative aspect-video rounded overflow-hidden border-2 border-graphite">
                      <iframe src={video.embedUrl} title={video.name || `Trailer ${index + 1}`} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Similar Games */}
          {similarGames.length > 0 && (
            <div className="bg-navy border-2 border-graphite rounded p-6">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-4">Similar Games</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {similarGames.slice(0, 8).map((sg, index) => (
                  <div key={index} className="group cursor-pointer">
                    <div className="relative aspect-[3/4] rounded overflow-hidden border-2 border-graphite bg-graphite group-hover:border-primary transition-colors">
                      {sg.cover ? (
                        <img src={sg.cover} alt={sg.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs text-center p-2">No Cover</div>
                      )}
                    </div>
                    <p className="mt-2 text-xs font-bold text-white truncate uppercase group-hover:text-primary transition-colors">{sg.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Artworks */}
          {artworks.length > 0 && (
            <div className="bg-navy border-2 border-graphite rounded p-6">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-4">Artworks</h2>
              <div className="grid grid-cols-2 gap-3">
                {artworks.map((artwork, index) => (
                  <div key={index} className="relative aspect-video rounded overflow-hidden border-2 border-graphite">
                    <img src={artwork.url} alt={`Artwork ${index + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" loading="lazy" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div className="bg-navy border-2 border-graphite rounded p-6">
            <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-4">Reviews</h2>
            {user ? (
              <div className="mb-8">
                <ReviewForm gameId={game.id} onReviewSubmitted={onReviewSubmitted} />
              </div>
            ) : (
              <div className="mb-8 p-4 bg-graphite/30 rounded text-center text-gray-400 font-bold uppercase text-sm">
                Log in to write a review
              </div>
            )}
            <ReviewList gameId={game.id} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status */}
          {userGame ? (
            <div className="bg-navy border-2 border-graphite rounded p-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Status</h3>
              <div className="space-y-2">
                {statusButtons.map((status) => (
                  <button
                    key={status}
                    onClick={() => handleUpdateLibrary({ status })}
                    className={`w-full px-3 py-2 rounded text-sm font-bold uppercase tracking-wider transition-colors ${userGame.status === status
                        ? 'bg-primary text-navy'
                        : 'bg-graphite/50 text-gray-400 hover:bg-graphite hover:text-white'
                      }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <button
              onClick={() => handleUpdateLibrary({ status: 'BACKLOG' })}
              className="w-full px-4 py-4 bg-primary text-navy font-bold uppercase tracking-widest rounded hover:bg-yellow-400 transition-colors shadow-glow-yellow"
            >
              + Add to Library
            </button>
          )}

          {libraryError && (
            <div className="p-3 bg-crimson/20 border border-crimson rounded text-crimson text-sm font-bold">
              {libraryError}
            </div>
          )}

          {/* Game Info */}
          <div className="bg-navy border-2 border-graphite rounded p-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Game Info</h3>
            <div className="space-y-3 text-sm">
              {game.genres?.length > 0 && (
                <div>
                  <span className="text-gray-500 block mb-1 font-bold uppercase text-xs">Genres</span>
                  <div className="flex gap-1 flex-wrap">
                    {game.genres.map((genre) => (
                      <span key={genre} className="text-xs px-2 py-1 bg-graphite/50 text-gray-300 rounded">{genre}</span>
                    ))}
                  </div>
                </div>
              )}

              {game.platforms?.length > 0 && (
                <div>
                  <span className="text-gray-500 block mb-1 font-bold uppercase text-xs">Platforms</span>
                  <div className="flex gap-1 flex-wrap">
                    {game.platforms.map((platform) => (
                      <span key={platform} className="text-xs px-2 py-1 bg-primary/10 text-primary rounded border border-primary/20 font-bold">{platform}</span>
                    ))}
                  </div>
                </div>
              )}

              {themes.length > 0 && (
                <div>
                  <span className="text-gray-500 block mb-1 font-bold uppercase text-xs">Themes</span>
                  <div className="flex gap-1 flex-wrap">
                    {themes.map((theme) => (
                      <span key={theme} className="text-xs px-2 py-1 bg-graphite/50 text-gray-300 rounded">{theme}</span>
                    ))}
                  </div>
                </div>
              )}

              {gameModes.length > 0 && (
                <div>
                  <span className="text-gray-500 block mb-1 font-bold uppercase text-xs">Game Modes</span>
                  <div className="flex gap-1 flex-wrap">
                    {gameModes.map((mode) => (
                      <span key={mode} className="text-xs px-2 py-1 bg-graphite/50 text-gray-300 rounded">{mode}</span>
                    ))}
                  </div>
                </div>
              )}

              {(developers.length > 0 || game.developer) && (
                <div>
                  <span className="text-gray-500 block mb-1 font-bold uppercase text-xs">Developer</span>
                  <span className="text-white font-bold">{developers.length > 0 ? developers.map(d => d.name).join(', ') : game.developer}</span>
                </div>
              )}

              {(publishers.length > 0 || game.publisher) && (
                <div>
                  <span className="text-gray-500 block mb-1 font-bold uppercase text-xs">Publisher</span>
                  <span className="text-white font-bold">{publishers.length > 0 ? publishers.map(p => p.name).join(', ') : game.publisher}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Screenshot Lightbox */}
      {lightboxOpen && screenshots.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={closeLightbox}>
          <button className="absolute top-4 right-4 text-white text-3xl hover:text-primary transition-colors z-10" onClick={closeLightbox}>✕</button>
          <button className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-4xl hover:text-primary transition-colors z-10" onClick={(e) => { e.stopPropagation(); prevImage(); }}>‹</button>
          <img src={screenshots[lightboxIndex]?.urlHD || screenshots[lightboxIndex]?.url} alt={`Screenshot ${lightboxIndex + 1}`} className="max-w-[90vw] max-h-[85vh] object-contain rounded" onClick={(e) => e.stopPropagation()} />
          <button className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-4xl hover:text-primary transition-colors z-10" onClick={(e) => { e.stopPropagation(); nextImage(); }}>›</button>
          <div className="absolute bottom-4 text-gray-400 text-sm font-bold">{lightboxIndex + 1} / {screenshots.length}</div>
        </div>
      )}
    </div>
  );
};
