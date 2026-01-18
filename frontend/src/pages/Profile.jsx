import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header, LoadingSkeleton } from '../components/Layout';
import { GameCard } from '../components/GameCard';
import { useAuth } from '../contexts/AuthContext';

export const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userLibrary, setUserLibrary] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user || !user.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const libraryResponse = await fetch(`http://localhost:5000/api/users/${user.id}/library`, {
          credentials: 'include',
        });
        if (!libraryResponse.ok) throw new Error('Failed to fetch library');
        const libraryData = await libraryResponse.json();
        // Backend returns { games: [], pagination: {} }
        const games = libraryData.games || libraryData || [];
        setUserLibrary(games);

        // If backend provides profile data, use it; otherwise use auth user
        setUserProfile({
          username: user.username || 'Player',
          avatar: user.avatar || '👾',
          bio: user.bio || 'No bio yet',
          followers: user.followers || 0,
          following: user.following || 0,
          favoriteGenres: user.favoriteGenres || [],
        });
        setError(null);
      } catch (err) {
        console.error('Failed to fetch user data:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  if (loading) {
    return (
      <div>
        <Header title="Profile" subtitle="Your gaming profile" />
        <LoadingSkeleton />
      </div>
    );
  }

  if (error || !userProfile) {
    return (
      <div>
        <Header title="Profile" subtitle="Your gaming profile" />
        <div className="text-center py-12 text-gray-400">
          {error || 'Unable to load profile'}
        </div>
      </div>
    );
  }

  const recentGames = Array.isArray(userLibrary)
    ? userLibrary.slice(-4).reverse()
    : [];

  const totalHours = Array.isArray(userLibrary)
    ? userLibrary.reduce((sum, g) => sum + (g.totalHours || 0), 0)
    : 0;

  return (
    <div>
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-retro-neon-blue/20 to-retro-neon-magenta/20 border border-retro-neon-blue/30 rounded-lg p-8 mb-8">
        <div className="flex items-start justify-between">
          <div className="flex gap-6">
            <div className="text-7xl">{userProfile.avatar}</div>
            <div>
              <h1 className="text-3xl font-bold text-retro-neon-green font-pixel mb-2">
                {userProfile.username}
              </h1>
              <p className="text-gray-400 mb-4">{userProfile.bio}</p>
              <div className="flex gap-6 text-sm">
                <div>
                  <span className="font-bold text-retro-neon-blue">
                    {userProfile.followers}
                  </span>
                  <span className="text-gray-400 ml-2">followers</span>
                </div>
                <div>
                  <span className="font-bold text-retro-neon-magenta">
                    {userProfile.following}
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
            {Array.isArray(userLibrary) ? userLibrary.length : 0}
          </div>
          <div className="text-xs text-gray-400 mt-1">Games Tracked</div>
        </div>

        <div className="bg-retro-purple border border-retro-neon-magenta/30 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-retro-neon-magenta font-mono">
            {Array.isArray(userLibrary)
              ? userLibrary.filter((g) => g.status === 'COMPLETED').length
              : 0}
          </div>
          <div className="text-xs text-gray-400 mt-1">Completed</div>
        </div>
      </div>

      {/* Favorite Genres */}
      {userProfile.favoriteGenres.length > 0 && (
        <div className="bg-retro-purple border border-retro-neon-yellow/30 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-bold text-retro-neon-yellow mb-4">
            Favorite Genres
          </h2>
          <div className="flex flex-wrap gap-2">
            {userProfile.favoriteGenres.map((genre) => (
              <span
                key={genre}
                className="px-4 py-2 bg-retro-neon-yellow/20 text-retro-neon-yellow rounded-lg font-bold text-sm"
              >
                {genre}
              </span>
            ))}
          </div>
        </div>
      )}

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
