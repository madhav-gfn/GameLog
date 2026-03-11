import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userApi } from '../api/userApi';
import { analyticsApi } from '../api/analyticsApi';
import { followApi } from '../api/followApi';

export const RightPanel = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState(null);
    const [following, setFollowing] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.id) {
                setLoading(false);
                return;
            }
            try {
                setLoading(true);

                // Fetch all data in parallel
                const [profileRes, analyticsRes, followingRes] = await Promise.allSettled([
                    userApi.getUserProfile(user.id),
                    analyticsApi.getOverview(),
                    followApi.getFollowing(user.id),
                ]);

                if (profileRes.status === 'fulfilled') {
                    setProfile(profileRes.value);
                }
                if (analyticsRes.status === 'fulfilled') {
                    setStats(analyticsRes.value?.data || analyticsRes.value);
                }
                if (followingRes.status === 'fulfilled') {
                    const followData = followingRes.value;
                    setFollowing(followData.following || followData || []);
                }
            } catch (err) {
                console.error('RightPanel fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const displayName = profile?.displayName || profile?.username || user?.displayName || user?.username || user?.email?.split('@')[0] || 'Player';
    const avatarLetter = displayName[0]?.toUpperCase() || 'P';
    const avatarUrl = profile?.avatar || user?.avatar;

    const gameStats = stats?.games || {};
    const totalGames = gameStats.totalGames || 0;
    const completionRate = gameStats.completionRate || 0;
    const averageRating = gameStats.averageRating || 0;

    const followerCount = profile?.stats?.followers || profile?._count?.followers || 0;
    const followingCount = profile?.stats?.following || profile?._count?.following || 0;

    return (
        <aside className="right-panel w-80 flex-shrink-0 bg-navy border-l-2 border-graphite overflow-y-auto">
            {/* Profile Section */}
            <div className="p-6 border-b-2 border-graphite bg-navy text-white">
                <div className="flex items-center gap-4 mb-4">
                    {avatarUrl ? (
                        <img
                            src={avatarUrl}
                            alt={displayName}
                            className="w-16 h-16 rounded-full bg-primary border-2 border-white object-cover"
                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                        />
                    ) : null}
                    <div
                        className={`w-16 h-16 rounded-full bg-primary border-2 border-white flex items-center justify-center text-navy font-bold text-2xl ${avatarUrl ? 'hidden' : ''}`}
                    >
                        {avatarLetter}
                    </div>
                    <div>
                        <h3 className="font-bold text-xl uppercase tracking-wider">{displayName}</h3>
                        <div className="flex items-center gap-1 text-primary">
                            <span className="material-symbols-outlined text-sm">military_tech</span>
                            <span className="text-xs font-bold uppercase">{totalGames} Games</span>
                        </div>
                    </div>
                </div>

                {/* Follower stats */}
                <div className="flex gap-4 text-sm mb-3">
                    <div>
                        <span className="font-bold text-primary">{followerCount}</span>
                        <span className="text-gray-400 ml-1">followers</span>
                    </div>
                    <div>
                        <span className="font-bold text-primary">{followingCount}</span>
                        <span className="text-gray-400 ml-1">following</span>
                    </div>
                </div>

                {/* XP-style progress bar (based on completion rate) */}
                <div className="w-full bg-graphite rounded-full h-2 mb-1">
                    <div
                        className="bg-primary h-2 rounded-full transition-all duration-500"
                        style={{ width: `${completionRate}%` }}
                    />
                </div>
                <p className="text-xs text-gray-400 text-right font-medium">{completionRate}% Completion Rate</p>
            </div>

            {/* Game Stats */}
            <div className="p-6 border-b-2 border-graphite">
                <h3 className="font-bold text-lg uppercase tracking-widest mb-4 flex items-center gap-2 text-white">
                    <span className="material-symbols-outlined text-primary">bar_chart</span>
                    Game Stats
                </h3>
                {loading ? (
                    <div className="space-y-4 animate-pulse">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex justify-between">
                                <div className="h-4 bg-graphite rounded w-24" />
                                <div className="h-4 bg-graphite rounded w-12" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400 font-bold uppercase text-sm">Total Games</span>
                            <span className="font-bold text-xl text-primary">{totalGames}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400 font-bold uppercase text-sm">Completion</span>
                            <span className="font-bold text-xl">{completionRate}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400 font-bold uppercase text-sm">Avg Rating</span>
                            <span className="font-bold text-xl">{averageRating ? `${averageRating}/10` : 'N/A'}</span>
                        </div>

                        {/* Status breakdown */}
                        {gameStats.statusCounts && (
                            <div className="pt-3 border-t border-graphite space-y-2">
                                {Object.entries(gameStats.statusCounts).map(([status, count]) => (
                                    <div key={status} className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500 uppercase font-bold text-xs">{status}</span>
                                        <span className="font-bold text-gray-300">{count}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Genre Breakdown */}
            {stats?.genres && stats.genres.length > 0 && (
                <div className="p-6 border-b-2 border-graphite">
                    <h3 className="font-bold text-lg uppercase tracking-widest mb-4 flex items-center gap-2 text-white">
                        <span className="material-symbols-outlined text-primary">category</span>
                        Top Genres
                    </h3>
                    <div className="space-y-2">
                        {stats.genres.slice(0, 5).map((g) => (
                            <div key={g.genre} className="flex justify-between items-center text-sm">
                                <span className="text-gray-400 font-bold">{g.genre}</span>
                                <span className="font-bold text-primary">{g.gameCount}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Following / Squad */}
            <div className="p-6">
                <h3 className="font-bold text-lg uppercase tracking-widest mb-4 flex items-center gap-2 text-white">
                    <span className="material-symbols-outlined text-primary">group</span>
                    Following
                </h3>
                {following.length > 0 ? (
                    <div className="space-y-4">
                        {following.slice(0, 5).map((f) => {
                            const followedUser = f.following || f;
                            return (
                                <div key={followedUser.id} className="flex items-center gap-3 group cursor-pointer">
                                    <div className="relative">
                                        {followedUser.avatar ? (
                                            <img src={followedUser.avatar} alt="" className="w-10 h-10 rounded-full bg-gray-700 object-cover" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-graphite flex items-center justify-center text-white font-bold text-sm">
                                                {(followedUser.username || followedUser.displayName || '?')[0]?.toUpperCase()}
                                            </div>
                                        )}
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-navy rounded-full" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-sm uppercase group-hover:text-primary transition-colors">
                                            {followedUser.username || followedUser.displayName || 'User'}
                                        </h4>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-gray-500 text-sm">Not following anyone yet</p>
                )}
            </div>
        </aside>
    );
};
