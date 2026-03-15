import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { userApi } from '../api/userApi';
import { analyticsApi } from '../api/analyticsApi';
import { followApi } from '../api/followApi';

export const ProfileDropdown = () => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const wrapRef = useRef(null);

  const loadProfileData = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const [profileRes, analyticsRes, followingRes] = await Promise.allSettled([
        userApi.getUserProfile(user.id),
        analyticsApi.getOverview(),
        followApi.getFollowing(user.id, { limit: 5 }),
      ]);

      if (profileRes.status === 'fulfilled') setProfile(profileRes.value);
      if (analyticsRes.status === 'fulfilled') setStats(analyticsRes.value?.data || analyticsRes.value);
      if (followingRes.status === 'fulfilled') {
        setFollowing(followingRes.value?.following || followingRes.value?.users || []);
      }
    } catch (_err) {
      setError('Failed to load profile details');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (open) loadProfileData();
  }, [open, loadProfileData]);

  useEffect(() => {
    const onDocClick = (event) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const onEscape = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEscape);

    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEscape);
    };
  }, []);

  const displayName = profile?.displayName || profile?.username || user?.displayName || user?.username || user?.email?.split('@')[0] || 'Player';
  const avatarLetter = displayName[0]?.toUpperCase() || 'P';
  const trackedGames = stats?.games?.totalGames || 0;
  const statItems = [
    { label: 'Completed', value: stats?.games?.statusCounts?.COMPLETED || 0 },
    { label: 'Completion', value: `${stats?.games?.completionRate || 0}%` },
    { label: 'Avg rating', value: stats?.games?.averageRating || 0 },
  ];

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Open profile menu"
        className="flex items-center gap-3 rounded-xl border border-graphite bg-background-dark/60 px-3 py-2 text-left transition-colors hover:border-primary focus-visible:ring-2 focus-visible:ring-primary"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold uppercase text-navy">
          {avatarLetter}
        </div>
        <div className="hidden min-w-0 sm:block">
          <p className="truncate text-sm font-bold uppercase tracking-wider text-white">{displayName}</p>
          <p className="text-[11px] uppercase tracking-[0.24em] text-gray-400">{trackedGames} tracked games</p>
        </div>
        <span className={`material-symbols-outlined text-gray-300 transition-transform ${open ? 'rotate-180' : ''}`}>expand_more</span>
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-3 w-[22rem] overflow-hidden rounded-2xl border border-graphite bg-navy shadow-2xl" role="menu" aria-label="Profile menu">
          <div className="border-b border-graphite bg-background-dark/40 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-primary bg-primary/15 text-xl font-bold uppercase text-primary">
                {avatarLetter}
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-lg font-bold uppercase tracking-wide text-white">{displayName}</h3>
                <p className="text-xs uppercase tracking-[0.24em] text-gray-400">{trackedGames} tracked games</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 p-4">
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/profile"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-graphite bg-background-dark/40 px-3 py-3 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:border-primary hover:text-primary"
              >
                View profile
              </Link>
              <Link
                to="/notifications"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-graphite bg-background-dark/40 px-3 py-3 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:border-primary hover:text-primary"
              >
                Notifications
              </Link>
            </div>

            {error && (
              <div className="rounded-xl border border-crimson bg-crimson/10 px-3 py-3 text-sm text-crimson">
                {error}
              </div>
            )}

            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-gray-400">Quick stats</p>
              <div className="grid grid-cols-3 gap-3">
                {statItems.map((item) => (
                  <div key={item.label} className="rounded-xl border border-graphite bg-background-dark/40 px-3 py-3 text-center">
                    <p className="text-lg font-bold text-primary">{loading ? '--' : item.value}</p>
                    <p className="mt-1 text-[11px] uppercase tracking-wide text-gray-500">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-gray-400">Following</p>
                {loading && <span className="text-[11px] uppercase tracking-wide text-gray-500">Loading...</span>}
              </div>

              {!loading && following.length === 0 && (
                <div className="rounded-xl border border-dashed border-graphite px-3 py-4 text-sm text-gray-500">
                  Follow users to populate this list.
                </div>
              )}

              <div className="space-y-2">
                {following.slice(0, 5).map((person) => (
                  <div key={person.id} className="flex items-center justify-between rounded-xl border border-graphite bg-background-dark/30 px-3 py-2">
                    <span className="truncate text-sm text-white">{person.displayName || person.username}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-graphite p-3">
            <button
              type="button"
              onClick={async () => {
                setOpen(false);
                await logout();
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-crimson px-4 py-3 text-sm font-bold uppercase tracking-[0.22em] text-white transition-colors hover:bg-red-700"
            >
              <span className="material-symbols-outlined text-base">logout</span>
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
