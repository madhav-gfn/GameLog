import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { userApi } from '../api/userApi';
import { analyticsApi } from '../api/analyticsApi';
import { ListsManager } from '../components/ListsManager';
import { ProfileHeader } from '../components/ProfileHeader';
import { GameCard } from '../components/GameCard';

export const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Overview');
  const [userLibrary, setUserLibrary] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);

        const [libraryRes, profileRes, analyticsRes] = await Promise.allSettled([
          userApi.getUserLibrary(user.id),
          userApi.getUserProfile(user.id),
          analyticsApi.getOverview(),
        ]);

        if (libraryRes.status === 'fulfilled') {
          setUserLibrary(libraryRes.value.games || []);
        }

        if (profileRes.status === 'fulfilled') {
          setUserProfile(profileRes.value);
        } else {
          setUserProfile({
            username: user.username || user.displayName || user.email?.split('@')[0] || 'Player',
            avatar: user.avatar || null,
            bio: user.bio || 'No bio yet',
          });
        }

        if (analyticsRes.status === 'fulfilled') {
          setAnalytics(analyticsRes.value?.data || analyticsRes.value);
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
        <ProfileHeader loading />
        <div className="bg-navy border-2 border-graphite rounded p-8 animate-pulse">
          <div className="flex gap-6">
            <div className="w-24 h-24 bg-graphite rounded-full" />
            <div className="space-y-3 flex-1">
              <div className="h-8 bg-graphite rounded w-48" />
              <div className="h-4 bg-graphite rounded w-32" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !userProfile) {
    return (
      <div>
        <ProfileHeader error={error || 'Unable to load profile'} />
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-crimson text-6xl mb-4 block">error</span>
          <p className="text-gray-400">{error || 'Unable to load profile'}</p>
        </div>
      </div>
    );
  }

  const displayName = userProfile.displayName || userProfile.username || user?.email?.split('@')[0] || 'Player';
  const avatarUrl = userProfile.avatar || user?.avatar;
  const avatarLetter = displayName[0]?.toUpperCase() || 'P';

  const followerCount = userProfile.stats?.followers || userProfile._count?.followers || 0;
  const followingCount = userProfile.stats?.following || userProfile._count?.following || 0;

  const gameStats = analytics?.games || {};

  // Transform UserGame objects for display
  const transformedLibrary = userLibrary.map((ug) => ({
    ...ug.game,
    id: ug.gameId,
    rawgId: ug.game?.rawgId || ug.gameId,
    status: ug.status,
    rating: ug.rating,
    updatedAt: ug.updatedAt,
  }));

  const recentGames = [...transformedLibrary]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 6);

  const tabs = ['Overview', 'Library', 'Lists'];

  return (
    <div>
      <ProfileHeader title="Profile" subtitle="YOUR STATS" />

      {/* Profile Card */}
      <div className="bg-navy border-2 border-graphite rounded p-8 mb-8">
        <div className="flex items-start gap-6">
          <div className="flex-shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-24 h-24 rounded-full object-cover border-2 border-primary"
                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
              />
            ) : null}
            <div
              className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl bg-primary text-navy font-bold border-2 border-white ${avatarUrl ? 'hidden' : ''}`}
            >
              {avatarLetter}
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white uppercase tracking-wider mb-2">{displayName}</h1>
            <p className="text-gray-400 mb-4">{userProfile.bio || 'No bio yet'}</p>
            <div className="flex gap-6 text-sm">
              <div>
                <span className="font-bold text-primary">{followerCount}</span>
                <span className="text-gray-500 ml-2 uppercase font-bold">followers</span>
              </div>
              <div>
                <span className="font-bold text-primary">{followingCount}</span>
                <span className="text-gray-500 ml-2 uppercase font-bold">following</span>
              </div>
              <div>
                <span className="font-bold text-primary">{gameStats.totalGames || 0}</span>
                <span className="text-gray-500 ml-2 uppercase font-bold">games</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b-2 border-graphite">
        <div className="flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-2 font-bold uppercase tracking-wider transition-colors relative ${activeTab === tab
                  ? 'text-primary'
                  : 'text-gray-500 hover:text-white'
                }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-8">
        {activeTab === 'Overview' && (
          <>
            {/* Analytics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total Games', value: gameStats.totalGames || 0, icon: 'sports_esports' },
                { label: 'Completed', value: gameStats.statusCounts?.COMPLETED || 0, icon: 'emoji_events' },
                { label: 'Completion', value: `${gameStats.completionRate || 0}%`, icon: 'percent' },
                { label: 'Avg Rating', value: gameStats.averageRating ? `${gameStats.averageRating}/10` : 'N/A', icon: 'star' },
              ].map((stat) => (
                <div key={stat.label} className="bg-navy border-2 border-graphite rounded p-4 text-center">
                  <span className="material-symbols-outlined text-primary text-2xl mb-2 block">{stat.icon}</span>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-gray-500 uppercase font-bold mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Recent Games */}
            <div>
              <h2 className="text-2xl font-bold text-white uppercase tracking-wider mb-6">Recently Updated</h2>
              {recentGames.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  {recentGames.map((game) => (
                    <div
                      key={game.id || game.rawgId}
                      onClick={() => navigate(`/game/${game.rawgId || game.id}`)}
                      className="cursor-pointer group"
                    >
                      <div className="aspect-[3/4] rounded overflow-hidden border-2 border-graphite group-hover:border-primary transition-colors bg-graphite">
                        <img
                          src={game.coverImage}
                          alt={game.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="96" height="128"%3E%3Crect fill="%232d3748" width="96" height="128"/%3E%3C/svg%3E';
                          }}
                        />
                      </div>
                      <p className="mt-2 text-xs font-bold text-white truncate uppercase group-hover:text-primary transition-colors">
                        {game.title}
                      </p>
                      <span className={`text-xs font-bold uppercase ${game.status === 'COMPLETED' ? 'text-primary' :
                          game.status === 'ABANDONED' ? 'text-crimson' :
                            'text-gray-500'
                        }`}>
                        {game.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  No games played yet. Start tracking your games!
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'Library' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {transformedLibrary.map((game) => (
              <GameCard key={game.id || game.rawgId} game={game} compact onClick={() => navigate(`/game/${game.rawgId || game.id}`)} />
            ))}
            {transformedLibrary.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500">
                Your library is empty.
              </div>
            )}
          </div>
        )}

        {activeTab === 'Lists' && (
          <ListsManager userId={user.id} />
        )}
      </div>
    </div>
  );
};
