import React, { useEffect } from 'react';
import { useAnalytics } from '../hooks/useAnalytics';

export const AnalyticsDashboard = () => {
    const { overview, fetchOverview, loading, error } = useAnalytics();

    useEffect(() => {
        fetchOverview();
    }, [fetchOverview]);

    if (loading) return <div>Loading analytics...</div>;
    if (error) return <div className="text-red-500">Failed to load analytics</div>;
    if (!overview) return null;

    const { games, genres } = overview;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">Your Gaming Stats</h2>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StatCard label="Games Playing" value={games.statusCounts.PLAYING || 0} />
                <StatCard label="Completed Games" value={games.statusCounts.COMPLETED || 0} />
            </div>

            {/* Genres */}
            <div className="card p-6">
                <h3 className="text-lg font-semibold mb-4 text-light-text-primary dark:text-dark-text-primary">Top Genres</h3>
                <div className="space-y-3">
                    {genres.slice(0, 5).map((g) => (
                        <div key={g.genre} className="flex items-center gap-4">
                            <div className="w-24 text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary truncate">{g.genre}</div>
                            <div className="flex-1 h-2 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-light-accent-primary dark:bg-dark-accent-primary"
                                    style={{ width: `${(g.gameCount / Math.max(...genres.map(x => x.gameCount))) * 100}%` }}
                                />
                            </div>
                            <div className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary w-16 text-right">{g.gameCount} games</div>
                        </div>
                    ))}
                    {genres.length === 0 && (
                        <div className="text-center py-8 text-light-text-tertiary dark:text-dark-text-tertiary font-medium">
                            No genre data available yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ label, value }) => (
    <div className="card p-4 text-center">
        <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wider">{label}</p>
        <p className="text-3xl font-bold text-light-accent-primary dark:text-dark-accent-primary mt-1">{value}</p>
    </div>
);
