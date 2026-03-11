import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { userApi } from '../api/userApi';

export const Library = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('PLAYING');

  useEffect(() => {
    const fetchUserLibrary = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await userApi.getUserLibrary(user.id);
        setGames(data.games || []);
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
    { value: 'PLAYING', label: 'Playing', icon: 'sports_esports' },
    { value: 'COMPLETED', label: 'Completed', icon: 'emoji_events' },
    { value: 'BACKLOG', label: 'Backlog', icon: 'list' },
    { value: 'ABANDONED', label: 'Dropped', icon: 'close' },
    { value: 'WISHLIST', label: 'Wishlist', icon: 'favorite' },
  ];

  const gamesInTab = games.filter((g) => g.status === activeTab);

  if (loading) {
    return (
      <div>
        <header className="mb-8 border-b-4 border-primary pb-4">
          <h2 className="text-5xl font-bold uppercase tracking-tighter text-white">Library</h2>
          <p className="text-primary font-bold uppercase tracking-widest mt-2 text-lg">YOUR COLLECTION</p>
        </header>
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-navy border-2 border-graphite rounded p-4 flex gap-4">
              <div className="w-24 h-32 bg-graphite rounded flex-shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-6 bg-graphite rounded w-1/3" />
                <div className="h-4 bg-graphite rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <header className="mb-8 border-b-4 border-primary pb-4">
          <h2 className="text-5xl font-bold uppercase tracking-tighter text-white">Library</h2>
        </header>
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-crimson text-6xl mb-4 block">error</span>
          <p className="text-gray-400 font-bold uppercase">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-8 border-b-4 border-primary pb-4">
        <h2 className="text-5xl font-bold uppercase tracking-tighter text-white">Library</h2>
        <p className="text-primary font-bold uppercase tracking-widest mt-2 text-lg">YOUR COLLECTION</p>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex items-center gap-2 px-4 py-2 rounded font-bold uppercase text-sm whitespace-nowrap transition-colors ${activeTab === tab.value
                ? 'bg-primary text-navy'
                : 'bg-graphite text-white hover:bg-navy'
              }`}
          >
            <span className="material-symbols-outlined text-lg">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {gamesInTab.length > 0 ? (
        <div className="space-y-4">
          {gamesInTab.map((userGame) => {
            const game = userGame.game || {};
            return (
              <div
                key={userGame.id}
                onClick={() => navigate(`/game/${game.rawgId || userGame.gameId}`)}
                className="flex gap-4 bg-navy border-2 border-graphite rounded p-4 cursor-pointer hover:border-primary transition-colors hover:shadow-glow-yellow group"
              >
                {/* Cover */}
                <div className="w-24 h-32 flex-shrink-0 rounded overflow-hidden bg-graphite">
                  <img
                    src={game.coverImage}
                    alt={game.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="96" height="128"%3E%3Crect fill="%232d3748" width="96" height="128"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="12"%3ENo Art%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-white text-lg uppercase">{game.title || 'Unknown'}</h3>
                      {game.releaseDate && (
                        <p className="text-sm text-gray-500">{new Date(game.releaseDate).getFullYear()}</p>
                      )}
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${userGame.status === 'COMPLETED' ? 'bg-primary text-navy' :
                        userGame.status === 'ABANDONED' ? 'bg-crimson text-white' :
                          'bg-graphite text-white'
                      }`}>
                      {userGame.status}
                    </span>
                  </div>

                  {game.genres && game.genres.length > 0 && (
                    <div className="flex gap-1 flex-wrap mb-2">
                      {game.genres.slice(0, 3).map((genre) => (
                        <span key={genre} className="text-xs px-2 py-0.5 bg-graphite/50 text-gray-400 rounded">
                          {genre}
                        </span>
                      ))}
                    </div>
                  )}

                  {userGame.rating && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-primary font-bold">★ {userGame.rating}/10</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-graphite text-6xl mb-4 block">
            {activeTab === 'PLAYING' ? 'sports_esports' : activeTab === 'COMPLETED' ? 'emoji_events' : 'list'}
          </span>
          <p className="text-gray-500 font-bold uppercase tracking-wider">No games here yet</p>
          <p className="text-gray-600 text-sm mt-2">
            {activeTab === 'WISHLIST'
              ? 'Add games to your wishlist from the discover page'
              : `Start adding games to your ${activeTab.toLowerCase()}`}
          </p>
        </div>
      )}
    </div>
  );
};
