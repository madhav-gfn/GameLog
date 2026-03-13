import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userApi } from '../api/userApi';
import { analyticsApi } from '../api/analyticsApi';
import { followApi } from '../api/followApi';

/** @param {{showFollowing?: boolean}} props */
export const RightRail = ({ showFollowing = true }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return setLoading(false);
      try {
        setLoading(true);
        setError(null);
        const [profileRes, analyticsRes, followingRes] = await Promise.allSettled([
          userApi.getUserProfile(user.id),
          analyticsApi.getOverview(),
          followApi.getFollowing(user.id),
        ]);
        if (profileRes.status === 'fulfilled') setProfile(profileRes.value);
        if (analyticsRes.status === 'fulfilled') setStats(analyticsRes.value?.data || analyticsRes.value);
        if (followingRes.status === 'fulfilled') setFollowing(followingRes.value.following || followingRes.value.users || []);
      } catch (_err) {
        setError('Failed to load right rail');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const displayName = profile?.displayName || profile?.username || user?.username || user?.email?.split('@')[0] || 'Player';

  return (
    <aside className="right-panel w-80 flex-shrink-0 bg-navy border-l-2 border-graphite overflow-y-auto" aria-label="Right rail">
      <div className="p-6 border-b-2 border-graphite bg-navy text-white">
        <h3 className="font-bold text-xl uppercase tracking-wider">{displayName}</h3>
        <p className="text-xs text-gray-400 mt-1">{stats?.games?.totalGames || 0} tracked games</p>
      </div>

      <div className="p-6 border-b-2 border-graphite">
        <h3 className="font-bold text-lg uppercase tracking-widest mb-4 text-white">Game Stats</h3>
        {loading && <div className="text-gray-400">Loading stats...</div>}
        {!loading && error && <div className="text-crimson">{error}</div>}
        {!loading && !error && (
          <div className="space-y-2 text-sm text-gray-300">
            <p>Completed: <span className="text-white">{stats?.games?.statusCounts?.COMPLETED || 0}</span></p>
            <p>Completion rate: <span className="text-white">{stats?.games?.completionRate || 0}%</span></p>
            <p>Avg rating: <span className="text-white">{stats?.games?.averageRating || 0}</span></p>
          </div>
        )}
      </div>

      {showFollowing && (
        <div className="p-6">
          <h3 className="font-bold text-lg uppercase tracking-widest mb-4 text-white">Following</h3>
          {loading && <div className="text-gray-400">Loading following...</div>}
          {!loading && following.length === 0 && <p className="text-gray-500">Follow users to populate this list.</p>}
          <div className="space-y-2">
            {following.slice(0, 6).map((person) => (
              <div key={person.id} className="flex items-center justify-between bg-graphite/30 rounded px-3 py-2">
                <span className="text-sm text-white truncate">{person.displayName || person.username}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};
