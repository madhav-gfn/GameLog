import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { userApi } from '../api/userApi';
import { analyticsApi } from '../api/analyticsApi';
import { followApi } from '../api/followApi';
import { listApi } from '../api/listApi';
import { ListsManager } from '../components/ListsManager';
import { ProfileHeader } from '../components/ProfileHeader';
import { GameCard } from '../components/GameCard';

const adaptStats = (profile, analytics, social, listCount) => ({
  followers: profile?.stats?.followers || profile?._count?.followers || social?.followers || 0,
  following: profile?.stats?.following || profile?._count?.following || social?.following || 0,
  games: analytics?.games?.totalGames || 0,
  completion: analytics?.games?.completionRate || 0,
  lists: listCount || 0,
});

export const Profile = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const targetUserId = searchParams.get('user');
  const { user } = useAuth();
  
  const profileUserId = targetUserId || user?.id;
  const [activeTab, setActiveTab] = useState('Overview');
  const [userLibrary, setUserLibrary] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [socialCounts, setSocialCounts] = useState({ followers: 0, following: 0 });
  const [listCount, setListCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!profileUserId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);

        const fetchPromises = [
          userApi.getUserLibrary(profileUserId),
          userApi.getUserProfile(profileUserId),
          analyticsApi.getOverview({ userId: profileUserId }),
          followApi.getFollowers(profileUserId, { limit: 1 }),
          followApi.getFollowing(profileUserId, { limit: 1 }),
          listApi.getUserLists(profileUserId),
        ];

        // Fetch follow status if viewing someone else
        if (user?.id && profileUserId !== user.id) {
          fetchPromises.push(followApi.checkFollowStatus(profileUserId));
        } else {
          fetchPromises.push(Promise.resolve(null)); // Placeholder to keep array length
        }

        const [libraryRes, profileRes, analyticsRes, followersRes, followingRes, listsRes, followStatusRes] = await Promise.allSettled(fetchPromises);

        if (libraryRes.status === 'fulfilled') setUserLibrary(libraryRes.value.games || []);

        if (profileRes.status === 'fulfilled') {
          setUserProfile(profileRes.value);
        } else if (profileUserId === user?.id && user) {
          setUserProfile({
            username: user.username || user.displayName || user.email?.split('@')[0] || 'Player',
            avatar: user.avatar || null,
            bio: user.bio || 'No bio yet',
          });
        } else {
          setUserProfile(null);
        }

        if (analyticsRes.status === 'fulfilled') setAnalytics(analyticsRes.value?.data || analyticsRes.value);

        if (followersRes.status === 'fulfilled' || followingRes.status === 'fulfilled') {
          const followers = followersRes.value?.total || followersRes.value?.count || followersRes.value?.followers?.length || 0;
          const following = followingRes.value?.total || followingRes.value?.count || followingRes.value?.following?.length || 0;
          setSocialCounts({ followers, following });
        }

        if (listsRes.status === 'fulfilled') {
          const lists = listsRes.value?.lists || listsRes.value || [];
          setListCount(lists.length || 0);
        }

        if (followStatusRes && followStatusRes.status === 'fulfilled' && followStatusRes.value) {
          setIsFollowing(followStatusRes.value.isFollowing || false);
        } else {
          setIsFollowing(false);
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
  }, [profileUserId, user]);

  const toggleFollow = async () => {
    if (!user?.id || followLoading) return;
    try {
      setFollowLoading(true);
      if (isFollowing) {
        await followApi.unfollowUser(profileUserId);
        setIsFollowing(false);
        setSocialCounts(prev => ({ ...prev, followers: Math.max(0, prev.followers - 1) }));
      } else {
        await followApi.followUser(profileUserId);
        setIsFollowing(true);
        setSocialCounts(prev => ({ ...prev, followers: prev.followers + 1 }));
      }
    } catch (err) {
      console.error('Failed to toggle follow status', err);
    } finally {
      setFollowLoading(false);
    }
  };

  const displayName = userProfile?.displayName || userProfile?.username || (profileUserId === user?.id ? (user?.email?.split('@')[0] || 'Player') : 'Player');
  const avatarUrl = userProfile?.avatar || (profileUserId === user?.id ? user?.avatar : null);
  const avatarLetter = displayName[0]?.toUpperCase() || 'P';
  const gameStats = analytics?.games || {};
  const stats = adaptStats(userProfile, analytics, socialCounts, listCount);

  const transformedLibrary = useMemo(() => userLibrary.map((ug) => ({
    ...ug.game,
    id: ug.gameId,
    rawgId: ug.game?.rawgId || ug.gameId,
    status: ug.status,
    rating: ug.rating,
    updatedAt: ug.updatedAt,
  })), [userLibrary]);

  const recentGames = useMemo(() => [...transformedLibrary].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 6), [transformedLibrary]);

  if (loading) return <div className="text-gray-500 uppercase font-bold">Loading profile…</div>;

  if (error || !userProfile) {
    return (
      <div className="text-center py-12">
        <span className="material-symbols-outlined text-crimson text-6xl mb-4 block">error</span>
        <p className="text-gray-400">{error || 'Unable to load profile'}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="relative mb-6 rounded overflow-hidden border-2 border-graphite">
        <div className="h-36 bg-gradient-to-r from-navy via-graphite to-navy" />
        <div className="absolute inset-0 p-6 flex items-end justify-between">
          <div className="flex items-center gap-4">
            {avatarUrl ? <img src={avatarUrl} alt={displayName} className="w-20 h-20 rounded-full object-cover border-2 border-primary" /> : <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl bg-primary text-navy font-bold border-2 border-white">{avatarLetter}</div>}
            <div>
              <h1 className="text-3xl font-bold text-white uppercase tracking-wider">{displayName}</h1>
              <p className="text-gray-300 text-sm">{userProfile.bio || 'No bio yet'}</p>
            </div>
          </div>
          {user?.id && profileUserId !== user.id && (
            <button
              onClick={toggleFollow}
              disabled={followLoading}
              className={`px-6 py-2 rounded font-bold uppercase tracking-wider transition-colors border-2 ${
                isFollowing 
                ? 'bg-transparent text-white border-gray-500 hover:border-white' 
                : 'bg-primary text-navy border-primary hover:bg-transparent hover:text-primary'
              } disabled:opacity-50`}
            >
              {followLoading ? '...' : (isFollowing ? 'Following' : 'Follow')}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
        {[
          { label: 'Followers', value: stats.followers },
          { label: 'Following', value: stats.following },
          { label: 'Games', value: stats.games },
          { label: 'Completion', value: `${stats.completion}%` },
          { label: 'Lists', value: stats.lists },
        ].map((stat) => (
          <div key={stat.label} className="bg-navy border-2 border-graphite rounded p-4 text-center">
            <p className="text-2xl font-bold text-primary">{stat.value}</p>
            <p className="text-xs text-gray-500 uppercase font-bold">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mb-6 border-b-2 border-graphite">
        <div className="flex gap-8">
          {['Overview', 'Library', 'Lists'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-4 px-2 font-bold uppercase tracking-wider relative ${activeTab === tab ? 'text-primary' : 'text-gray-500 hover:text-white'}`}>
              {tab}
              {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full" />}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-8">
        {activeTab === 'Overview' && (
          <>
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

            <div>
              <h2 className="text-2xl font-bold text-white uppercase tracking-wider mb-6">Recently Updated</h2>
              {recentGames.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  {recentGames.map((game) => (
                    <div key={game.id || game.rawgId} onClick={() => navigate(`/game/${game.rawgId || game.id}`)} className="cursor-pointer group">
                      <div className="aspect-[3/4] rounded overflow-hidden border-2 border-graphite group-hover:border-primary transition-colors bg-graphite">
                        <img src={game.coverImage} alt={game.title} className="w-full h-full object-cover" />
                      </div>
                      <p className="mt-2 text-xs font-bold text-white truncate uppercase group-hover:text-primary transition-colors">{game.title}</p>
                    </div>
                  ))}
                </div>
              ) : <div className="text-center py-12 text-gray-500">No games played yet. Start tracking your games!</div>}
            </div>
          </>
        )}

        {activeTab === 'Library' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {transformedLibrary.map((game) => (
              <div key={game.id || game.rawgId} onClick={() => navigate(`/game/${game.rawgId || game.id}`)} className="cursor-pointer group bg-navy border-2 border-graphite rounded overflow-hidden hover:border-primary transition-colors">
                <div className="aspect-video bg-graphite">
                  <img src={game.coverImage} alt={game.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-bold text-white truncate uppercase group-hover:text-primary transition-colors">{game.title}</h3>
                  {game.rating && <span className="text-xs text-primary font-bold">★ {game.rating}/10</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'Lists' && <ListsManager userId={profileUserId} />}
      </div>
    </div>
  );
};
