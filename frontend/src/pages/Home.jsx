import React, { useState, useEffect } from 'react';
import { SearchBar } from '../components/SearchBar';
import { TrendingCarousel } from '../components/TrendingCarousel';
import { TopRated } from '../components/TopRated';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { SocialFeed } from '../components/SocialFeed';
import { gameApi } from '../api/gameApi';

export const Home = () => {
  const [trendingGames, setTrendingGames] = useState([]);
  const [topRatedGames, setTopRatedGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch trending games (sorted by popularity or recent)
        const trendingData = await gameApi.getGames({ sortBy: 'popularity', page: 1 });
        setTrendingGames(trendingData.games?.slice(0, 10) || []);

        // Fetch top rated games
        const topRatedData = await gameApi.getGames({ sortBy: 'rating', page: 1 });
        setTopRatedGames(topRatedData.games?.slice(0, 4) || []);
      } catch (err) {
        console.error('Failed to fetch home data:', err);
        setError('Failed to load games');
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  return (
    <div>
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
          GameFolio:
        </h1>
        <p className="text-lg text-light-text-secondary dark:text-dark-text-secondary mb-6">
          Your Cozy Corner for Gaming Culture
        </p>
        <SearchBar className="max-w-2xl" />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Trending Now */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="space-y-4">
              <LoadingSkeleton count={3} />
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
              {error}
            </div>
          ) : (
            <TrendingCarousel games={trendingGames} title="Trending Now" />
          )}
        </div>

        {/* Right Column - Social & Top Rated */}
        <div className="lg:col-span-1 space-y-8">
          {/* Social Feed */}
          <div>
            <h2 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">
              Community Activity
            </h2>
            <SocialFeed />
          </div>

          {/* Top Rated */}
          <div>
            {loading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="card p-3 animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-light-bg-secondary dark:bg-dark-bg-secondary" />
                      <div className="flex-1 h-4 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? null : (
              <TopRated games={topRatedGames} title="Top Rated" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
