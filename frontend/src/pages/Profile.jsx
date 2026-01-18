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
        
        // Fetch library data
        const libraryResponse = await fetch(`http://localhost:5000/api/users/${user.id}/library`, {
          credentials: 'include',
        });
        if (!libraryResponse.ok) throw new Error('Failed to fetch library');
        const libraryData = await libraryResponse.json();
        // Backend returns { games: [UserGame objects with nested game], pagination: {} }
        const userGames = libraryData.games || [];
        setUserLibrary(userGames);

        // Fetch full user profile with stats
        try {
          const profileResponse = await fetch(`http://localhost:5000/api/users/${user.id}`, {
            credentials: 'include',
          });
          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            setUserProfile({
              username: profileData.username || profileData.displayName || user.email?.split('@')[0] || 'Player',
              avatar: profileData.avatar || user.avatar || '👾',
              bio: profileData.bio || 'No bio yet',
              followers: profileData._count?.followers || 0,
              following: profileData._count?.following || 0,
              favoriteGenres: profileData.favoriteGenres || [],
            });
          } else {
            // Fallback to auth user data
            setUserProfile({
              username: user.username || user.displayName || user.email?.split('@')[0] || 'Player',
              avatar: user.avatar || '👾',
              bio: user.bio || 'No bio yet',
              followers: 0,
              following: 0,
              favoriteGenres: [],
            });
          }
        } catch (profileError) {
          // Fallback to auth user data
          setUserProfile({
            username: user.username || user.displayName || user.email?.split('@')[0] || 'Player',
            avatar: user.avatar || '👾',
            bio: user.bio || 'No bio yet',
            followers: 0,
            following: 0,
            favoriteGenres: [],
          });
        }
        
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

  // Transform UserGame objects to include game data at top level for easier access
  const transformedLibrary = Array.isArray(userLibrary)
    ? userLibrary.map((userGame) => ({
        ...userGame.game,
        id: userGame.gameId, // Use gameId for navigation
        rawgId: userGame.game?.rawgId || userGame.gameId, // Fallback to gameId if rawgId not available
        status: userGame.status,
        rating: userGame.rating,
        review: userGame.review,
        totalHours: userGame.totalHours || 0,
        sessions: userGame.playCount || 0,
        updatedAt: userGame.updatedAt,
      }))
    : [];

  const recentGames = transformedLibrary
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 4);

  const totalHours = transformedLibrary.reduce((sum, g) => sum + (g.totalHours || 0), 0);

  return (
    <div>
      {/* Profile Header */}
      <div className="card p-8 mb-8">
        <div className="flex items-start justify-between">
          <div className="flex gap-6">
            <div className="flex-shrink-0">
              {userProfile.avatar && userProfile.avatar.startsWith('http') ? (
                <img
                  src={userProfile.avatar}
                  alt={userProfile.username}
                  className="w-24 h-24 rounded-full object-cover border-2 border-light-border-default dark:border-dark-border-default"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl bg-light-accent-primary dark:bg-dark-accent-primary text-white border-2 border-light-border-default dark:border-dark-border-default ${
                  userProfile.avatar && userProfile.avatar.startsWith('http') ? 'hidden' : ''
                }`}
              >
                {userProfile.avatar && !userProfile.avatar.startsWith('http') 
                  ? userProfile.avatar 
                  : userProfile.username?.[0]?.toUpperCase() || 'U'}
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
                {userProfile.username}
              </h1>
              <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">{userProfile.bio}</p>
              <div className="flex gap-6 text-sm">
                <div>
                  <span className="font-semibold text-light-accent-primary dark:text-dark-accent-primary">
                    {userProfile.followers}
                  </span>
                  <span className="text-light-text-tertiary dark:text-dark-text-tertiary ml-2">followers</span>
                </div>
                <div>
                  <span className="font-semibold text-light-accent-secondary dark:text-dark-accent-secondary">
                    {userProfile.following}
                  </span>
                  <span className="text-light-text-tertiary dark:text-dark-text-tertiary ml-2">following</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-12">
        <div className="card p-4 text-center">
          <div className="text-3xl font-bold text-light-accent-secondary dark:text-dark-accent-secondary">
            {totalHours}
          </div>
          <div className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary mt-1">Total Hours</div>
        </div>

        <div className="card p-4 text-center">
          <div className="text-3xl font-bold text-light-accent-primary dark:text-dark-accent-primary">
            {transformedLibrary.length}
          </div>
          <div className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary mt-1">Games Tracked</div>
        </div>

        <div className="card p-4 text-center">
          <div className="text-3xl font-bold text-light-accent-tertiary dark:text-dark-accent-tertiary">
            {transformedLibrary.filter((g) => g.status === 'COMPLETED').length}
          </div>
          <div className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary mt-1">Completed</div>
        </div>
      </div>

      {/* Favorite Genres */}
      {userProfile.favoriteGenres.length > 0 && (
        <div className="card p-6 mb-8">
          <h2 className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary mb-4">
            Favorite Genres
          </h2>
          <div className="flex flex-wrap gap-2">
            {userProfile.favoriteGenres.map((genre) => (
              <span
                key={genre}
                className="px-4 py-2 bg-light-accent-secondary/10 dark:bg-dark-accent-secondary/20 text-light-accent-secondary dark:text-dark-accent-secondary rounded-lg font-semibold text-sm"
              >
                {genre}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recently Played */}
      <div>
        <h2 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mb-6">
          Recently Played
        </h2>
        {recentGames.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentGames.map((game) => (
              <GameCard
                key={game.id || game.rawgId}
                game={game}
                compact
                onClick={() => navigate(`/game/${game.rawgId || game.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-light-text-tertiary dark:text-dark-text-tertiary">
            No games played yet. Start tracking your games!
          </div>
        )}
      </div>
    </div>
  );
};
