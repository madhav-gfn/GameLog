import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Layout';
import { GameCard } from '../components/GameCard';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { gameApi } from '../api/gameApi';

export const Discover = () => {
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [genres, setGenres] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [sortBy, setSortBy] = useState('rating');

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch games
        const gameData = await gameApi.getGames({ sortBy });
        setGames(gameData.games || []);

        // Fetch genres and platforms
        const genreData = await gameApi.getGenres();
        const platformData = await gameApi.getPlatforms();
        
        setGenres(genreData.genres || []);
        setPlatforms(platformData.platforms || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load games. Please make sure the backend is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle filter/sort changes
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

  return (
    <div>
      <Header
        title="Discover Games"
        subtitle="Browse the latest and greatest games"
      />

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div>
          <label className="block text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
            Genre
          </label>
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="w-full px-3 py-2 bg-light-bg-card dark:bg-dark-bg-card border border-light-border-default dark:border-dark-border-default rounded-lg text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:border-light-accent-primary dark:focus:border-dark-accent-primary transition-colors"
            disabled={loading || genres.length === 0}
          >
            <option value="">All Genres</option>
            {genres.map((genre) => (
              <option key={genre.id} value={genre.name}>
                {genre.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
            Platform
          </label>
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="w-full px-3 py-2 bg-light-bg-card dark:bg-dark-bg-card border border-light-border-default dark:border-dark-border-default rounded-lg text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:border-light-accent-primary dark:focus:border-dark-accent-primary transition-colors"
            disabled={loading || platforms.length === 0}
          >
            <option value="">All Platforms</option>
            {platforms.map((platform) => (
              <option key={platform.id} value={platform.name}>
                {platform.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
            Sort by
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2 bg-light-bg-card dark:bg-dark-bg-card border border-light-border-default dark:border-dark-border-default rounded-lg text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:border-light-accent-primary dark:focus:border-dark-accent-primary transition-colors"
            disabled={loading}
          >
            <option value="rating">Rating</option>
            <option value="year">Release Year</option>
            <option value="popularity">Popularity</option>
          </select>
        </div>
      </div>

      {/* Games Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <LoadingSkeleton count={12} />
        </div>
      ) : (
        <>
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
              <p className="text-light-text-tertiary dark:text-dark-text-tertiary text-lg">No games found with those filters.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
