import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header, LoadingSkeleton } from '../components/Layout';
import { RatingStars } from '../components/RatingStars';
import { ReviewForm } from '../components/ReviewForm';
import { ReviewList } from '../components/ReviewList';
import { gameApi } from '../api/gameApi';
import { reviewApi } from '../api/reviewApi';
import { listApi } from '../api/listApi';
import { api } from '../api/axios';
import { useAuth } from '../contexts/AuthContext';

const adaptReviewStats = (stats) => ({
  averageRating: stats?.averageRating || 0,
  totalReviews: stats?.totalReviews || stats?.count || 0,
});

export const GameDetail = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [game, setGame] = useState(null);
  const [userGame, setUserGame] = useState(null);
  const [reviewStats, setReviewStats] = useState({ averageRating: 0, totalReviews: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [libraryError, setLibraryError] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');
  const [listMessage, setListMessage] = useState('');

  const [, setSelectedStatus] = useState('BACKLOG');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const fetchGameData = useCallback(async () => {
    try {
      setLoading(true);
      const [gameData, statsData] = await Promise.all([
        gameApi.getGameDetail(gameId),
        reviewApi.getReviewStats(gameId).catch(() => null),
      ]);
      setGame(gameData);
      setReviewStats(adaptReviewStats(statsData));
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
      api.get(`/users/${user.id}/library`).then((res) => {
        const games = res.games || res || [];
        const found = games.find((g) => g.gameId === gameId || g.game?.rawgId === Number(gameId));
        if (found) {
          setUserGame(found);
          setSelectedStatus(found.status);
        }
      }).catch(console.error);
    }
  }, [gameId, user, fetchGameData]);

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

  const handleQuickListAdd = async () => {
    if (!user?.id || !game?.id) return;
    try {
      setListMessage('');
      const listsResponse = await listApi.getUserLists(user.id);
      const lists = listsResponse.lists || listsResponse || [];
      if (!lists.length) {
        setListMessage('Create a list first to save this game.');
        return;
      }
      await listApi.addGameToList(lists[0].id, { gameId: game.id });
      setListMessage(`Added to ${lists[0].name}.`);
    } catch (err) {
      console.error('Failed to add game to list:', err);
      setListMessage('Could not add game to list.');
    }
  };

  const onReviewSubmitted = () => {
    fetchGameData();
    window.location.reload();
  };

  const screenshots = game?.screenshots || [];
  const artworks = game?.artworks || [];
  const videos = game?.videos || [];
  const similarGames = game?.similarGames || [];
  const themes = game?.themes || [];
  const gameModes = game?.gameModes || [];
  const companies = game?.companies || [];
  const developers = companies.filter((c) => c.developer);
  const publishers = companies.filter((c) => c.publisher);
  const statusButtons = ['BACKLOG', 'PLAYING', 'COMPLETED', 'ABANDONED'];

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

  return (
    <div>
      <div className="mb-8 -mx-8 -mt-8">
        <div className="relative h-96 bg-graphite overflow-hidden">
          <img src={game.cover} alt={game.title} className="w-full h-full object-cover opacity-35" />
          <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/80 to-transparent" />
          <div className="absolute bottom-8 left-8 right-8">
            <h1 className="text-4xl sm:text-6xl font-bold text-white uppercase tracking-tighter mb-3">{game.title}</h1>
            <div className="flex gap-3 flex-wrap items-center text-sm">
              {game.releaseYear && <span className="text-gray-400 font-bold">{game.releaseYear}</span>}
              <RatingStars rating={game.averageRating} />
              <span className="text-gray-400">{reviewStats.totalReviews || game.ratingCount || 0} reviews</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 bg-navy border-2 border-graphite rounded p-4 flex flex-wrap gap-3 items-center">
        {userGame ? statusButtons.map((status) => (
          <button
            key={status}
            onClick={() => handleUpdateLibrary({ status })}
            className={`px-4 py-2 rounded text-xs font-bold uppercase ${userGame.status === status ? 'bg-primary text-navy' : 'bg-graphite text-gray-300'}`}
          >
            {status}
          </button>
        )) : (
          <button onClick={() => handleUpdateLibrary({ status: 'BACKLOG' })} className="px-4 py-3 bg-primary text-navy font-bold uppercase rounded">
            + Add to Library
          </button>
        )}
        <button onClick={handleQuickListAdd} className="px-4 py-3 bg-graphite text-white font-bold uppercase rounded">+ Save to List</button>
        {listMessage && <span className="text-xs font-bold text-primary uppercase">{listMessage}</span>}
        {libraryError && <span className="text-xs font-bold text-crimson uppercase">{libraryError}</span>}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Avg Rating', value: (reviewStats.averageRating || game.averageRating || 0).toFixed(1) },
          { label: 'Reviews', value: reviewStats.totalReviews || game.ratingCount || 0 },
          { label: 'Genres', value: game.genres?.length || 0 },
          { label: 'Platforms', value: game.platforms?.length || 0 },
        ].map((stat) => (
          <div key={stat.label} className="bg-navy border-2 border-graphite rounded p-4 text-center">
            <p className="text-2xl font-bold text-primary">{stat.value}</p>
            <p className="text-xs text-gray-500 font-bold uppercase">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mb-6 border-b-2 border-graphite flex gap-6">
        {['Overview', 'Media', 'Reviews', 'Similar'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 font-bold uppercase tracking-wider ${activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Overview' && (
        <div className="bg-navy border-2 border-graphite rounded p-6 mb-8">
          <h2 className="text-lg font-bold uppercase text-white mb-3">About</h2>
          <p className="text-gray-400 leading-relaxed">{game.description || 'No description available.'}</p>
          {game.storyline && <p className="mt-4 text-sm text-gray-500">{game.storyline}</p>}
          <div className="mt-6 grid sm:grid-cols-2 gap-4 text-sm">
            {developers.length > 0 && <p><span className="text-gray-500">Developer:</span> <span className="text-white">{developers.map((d) => d.name).join(', ')}</span></p>}
            {publishers.length > 0 && <p><span className="text-gray-500">Publisher:</span> <span className="text-white">{publishers.map((p) => p.name).join(', ')}</span></p>}
            {themes.length > 0 && <p><span className="text-gray-500">Themes:</span> <span className="text-white">{themes.join(', ')}</span></p>}
            {gameModes.length > 0 && <p><span className="text-gray-500">Modes:</span> <span className="text-white">{gameModes.join(', ')}</span></p>}
          </div>
        </div>
      )}

      {activeTab === 'Media' && (
        <div className="space-y-8 mb-8">
          {screenshots.length > 0 && (
            <div className="bg-navy border-2 border-graphite rounded p-6">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-4">Screenshots</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {screenshots.map((screenshot, index) => (
                  <button key={index} onClick={() => { setLightboxIndex(index); setLightboxOpen(true); }} className="relative aspect-video rounded overflow-hidden border-2 border-graphite">
                    <img src={screenshot.url} alt={`Screenshot ${index + 1}`} className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            </div>
          )}
          {videos.length > 0 && (
            <div className="bg-navy border-2 border-graphite rounded p-6">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-4">Videos</h2>
              <div className="space-y-4">
                {videos.slice(0, 3).map((video, index) => (
                  <iframe key={index} src={video.embedUrl} title={video.name || `Trailer ${index + 1}`} className="w-full aspect-video rounded border-2 border-graphite" allowFullScreen />
                ))}
              </div>
            </div>
          )}
          {artworks.length > 0 && (
            <div className="bg-navy border-2 border-graphite rounded p-6">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-4">Artworks</h2>
              <div className="grid grid-cols-2 gap-3">
                {artworks.map((artwork, index) => (
                  <div key={index} className="relative aspect-video rounded overflow-hidden border-2 border-graphite">
                    <img src={artwork.url} alt={`Artwork ${index + 1}`} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'Reviews' && (
        <div className="bg-navy border-2 border-graphite rounded p-6 mb-8">
          <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-4">Reviews</h2>
          {user ? <div className="mb-8"><ReviewForm gameId={game.id} onReviewSubmitted={onReviewSubmitted} /></div> : <div className="mb-8 p-4 bg-graphite/30 rounded text-center text-gray-400 font-bold uppercase text-sm">Log in to write a review</div>}
          <ReviewList gameId={game.id} />
        </div>
      )}

      {activeTab === 'Similar' && similarGames.length > 0 && (
        <div className="bg-navy border-2 border-graphite rounded p-6 mb-8">
          <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-4">Similar Games</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {similarGames.slice(0, 8).map((sg, index) => (
              <div key={index} className="group cursor-pointer" onClick={() => navigate(`/game/${sg.id || sg.rawgId}`)}>
                <div className="relative aspect-[3/4] rounded overflow-hidden border-2 border-graphite bg-graphite">
                  {sg.cover ? <img src={sg.cover} alt={sg.name} className="w-full h-full object-cover" loading="lazy" /> : <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs text-center p-2">No Cover</div>}
                </div>
                <p className="mt-2 text-xs font-bold text-white truncate uppercase">{sg.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {lightboxOpen && screenshots.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={() => setLightboxOpen(false)}>
          <img src={screenshots[lightboxIndex]?.urlHD || screenshots[lightboxIndex]?.url} alt={`Screenshot ${lightboxIndex + 1}`} className="max-w-[90vw] max-h-[85vh] object-contain rounded" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
};
