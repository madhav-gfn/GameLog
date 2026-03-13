import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Layout';
import { GameCard } from '../components/GameCard';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { gameApi } from '../api/gameApi';

const adaptSectionGames = (response) => response?.games || response?.items || [];

export const Discover = () => {
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [genres, setGenres] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [modules, setModules] = useState({ trending: [], topRated: [], recent: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [sortBy, setSortBy] = useState('rating');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [defaultGames, genreData, platformData, trendingRes, topRatedRes, recentRes] = await Promise.all([
          gameApi.getGames({ sortBy: 'rating' }),
          gameApi.getGenres(),
          gameApi.getPlatforms(),
          gameApi.getGames({ sortBy: 'popularity', limit: 8 }),
          gameApi.getGames({ sortBy: 'rating', limit: 8 }),
          gameApi.getGames({ sortBy: 'year', limit: 8 }),
        ]);

        setGames(defaultGames.games || []);
        setGenres(genreData.genres || []);
        setPlatforms(platformData.platforms || []);
        setModules({
          trending: adaptSectionGames(trendingRes),
          topRated: adaptSectionGames(topRatedRes),
          recent: adaptSectionGames(recentRes),
        });
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load games. Make sure the backend is running.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchFilteredGames = async () => {
      try {
        setLoading(true);
        const gameData = await gameApi.getGames({
          sortBy,
          genre: selectedGenre,
          platform: selectedPlatform,
        });
        setGames(gameData.games || []);
      } catch (err) {
        console.error('Error fetching filtered games:', err);
        setError('Failed to load games.');
      } finally {
        setLoading(false);
      }
    };
    fetchFilteredGames();
  }, [selectedGenre, selectedPlatform, sortBy]);

  const moduleConfig = useMemo(() => ([
    { key: 'trending', title: 'Trending now', subtitle: 'Most played by the community' },
    { key: 'topRated', title: 'Top rated picks', subtitle: 'Highest scored experiences' },
    { key: 'recent', title: 'Fresh releases', subtitle: 'Recently launched games' },
  ]), []);

  return (
    <div>
      <Header title="Discover" subtitle="Explore by modules, then drill into filters" />

      {error && (
        <div className="mb-6 p-4 bg-crimson/10 border-2 border-crimson rounded text-crimson font-bold text-sm">
          <span className="material-symbols-outlined text-sm align-middle mr-2">warning</span>
          {error}
        </div>
      )}

      <section className="space-y-8 mb-10">
        {moduleConfig.map((module) => (
          <div key={module.key}>
            <div className="flex items-end justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white uppercase tracking-wider">{module.title}</h2>
                <p className="text-gray-500 text-sm uppercase">{module.subtitle}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {(modules[module.key] || []).slice(0, 4).map((game) => (
                <GameCard
                  key={`${module.key}-${game.id}`}
                  game={game}
                  onClick={() => navigate(`/game/${game.id}`)}
                />
              ))}
            </div>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div>
          <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Genre</label>
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="w-full px-3 py-2 bg-navy border-2 border-graphite rounded text-white font-bold uppercase text-sm focus:outline-none focus:border-primary transition-colors"
            disabled={loading || genres.length === 0}
          >
            <option value="">All Genres</option>
            {genres.map((genre) => (
              <option key={genre.id} value={genre.name}>{genre.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Platform</label>
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="w-full px-3 py-2 bg-navy border-2 border-graphite rounded text-white font-bold uppercase text-sm focus:outline-none focus:border-primary transition-colors"
            disabled={loading || platforms.length === 0}
          >
            <option value="">All Platforms</option>
            {platforms.map((platform) => (
              <option key={platform.id} value={platform.name}>{platform.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2 bg-navy border-2 border-graphite rounded text-white font-bold uppercase text-sm focus:outline-none focus:border-primary transition-colors"
            disabled={loading}
          >
            <option value="rating">Rating</option>
            <option value="year">Release Year</option>
            <option value="popularity">Popularity</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <LoadingSkeleton count={12} />
        </div>
      ) : (
        <>
          <h3 className="text-xl font-bold text-white uppercase tracking-wider mb-4">All discover results</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {games.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onClick={() => navigate(`/game/${game.id}`)}
              />
            ))}
          </div>

          {games.length === 0 && (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-graphite text-6xl mb-4 block">search_off</span>
              <p className="text-gray-500 font-bold uppercase tracking-wider">No games found with those filters</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
