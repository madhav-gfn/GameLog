import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header, LoadingSkeleton } from '../components/Layout';
import { GameCard } from '../components/GameCard';
import { useAuth } from '../contexts/AuthContext';

import { AnalyticsDashboard } from '../components/AnalyticsDashboard';
import { ListsManager } from '../components/ListsManager';

export const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Overview');
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
        } catch {
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
      id: userGame.gameId,
      rawgId: userGame.game?.rawgId || userGame.gameId,
      status: userGame.status,
      rating: userGame.rating,
      review: userGame.review,
      updatedAt: userGame.updatedAt,
    }))
    : [];

  const recentGames = transformedLibrary
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 4);



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
                className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl bg-light-accent-primary dark:bg-dark-accent-primary text-white border-2 border-light-border-default dark:border-dark-border-default ${userProfile.avatar && userProfile.avatar.startsWith('http') ? 'hidden' : ''
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

      {/* Profile Content Tabs */}
      <div className="mb-6 border-b border-light-border-default dark:border-dark-border-default">
        <div className="flex gap-8">
          {['Overview', 'Library', 'Lists'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-2 font-medium transition-colors relative ${activeTab === tab
                ? 'text-light-accent-primary dark:text-dark-accent-primary'
                : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary'
                }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-light-accent-primary dark:bg-dark-accent-primary rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-8">
        {activeTab === 'Overview' && (
          <>
            <AnalyticsDashboard />

            {/* Recently Played */}
            <div className="mt-8">
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
          </>
        )}

        {activeTab === 'Library' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {transformedLibrary.map((game) => (
              <GameCard
                key={game.id || game.rawgId}
                game={game}
                onClick={() => navigate(`/game/${game.rawgId || game.id}`)}
              />
            ))}
            {transformedLibrary.length === 0 && (
              <div className="col-span-full text-center py-12 text-light-text-tertiary dark:text-dark-text-tertiary">
                Your library is empty.
              </div>
            )}
          </div>
        )}

        {activeTab === 'Lists' && (
          <ListsManager userId={userProfile.id || user.id} />
        )}
      </div>
    </div>
  );
};
