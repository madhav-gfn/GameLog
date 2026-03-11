import React, { useEffect } from 'react';
import { useAnalytics } from '../hooks/useAnalytics';

export const AnalyticsDashboard = () => {
    const { overview, fetchOverview, loading, error } = useAnalytics();

    useEffect(() => {
        fetchOverview();
    }, [fetchOverview]);

    if (loading) return <div className="text-gray-400 font-bold uppercase">Loading analytics...</div>;
    if (error) return <div className="text-crimson font-bold">Failed to load analytics</div>;
    if (!overview) return null;

    const { games, genres } = overview;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Your Gaming Stats</h2>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StatCard label="Games Playing" value={games.statusCounts?.PLAYING || 0} />
                <StatCard label="Completed Games" value={games.statusCounts?.COMPLETED || 0} />
            </div>

            {/* Genres */}
            <div className="bg-navy border-2 border-graphite rounded p-6">
                <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-4">Top Genres</h3>
                <div className="space-y-3">
                    {genres.slice(0, 5).map((g) => (
                        <div key={g.genre} className="flex items-center gap-4">
                            <div className="w-24 text-sm font-bold text-gray-400 truncate">{g.genre}</div>
                            <div className="flex-1 h-2 bg-graphite rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary transition-all"
                                    style={{ width: `${(g.gameCount / Math.max(...genres.map(x => x.gameCount))) * 100}%` }}
                                />
                            </div>
                            <div className="text-xs text-gray-500 w-16 text-right font-bold">{g.gameCount} games</div>
                        </div>
                    ))}
                    {genres.length === 0 && (
                        <div className="text-center py-8 text-gray-500 font-bold uppercase">
                            No genre data available yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ label, value }) => (
    <div className="bg-navy border-2 border-graphite rounded p-4 text-center">
        <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">{label}</p>
        <p className="text-3xl font-bold text-primary mt-1">{value}</p>
    </div>
);
