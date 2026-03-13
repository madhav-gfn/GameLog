import React from 'react';

const EmptyState = ({ title, message }) => (
  <div className="bg-graphite/40 border border-graphite rounded p-4 min-h-44 flex flex-col justify-center items-center text-center">
    <p className="text-sm font-bold text-white uppercase tracking-wide">{title}</p>
    <p className="text-xs text-gray-400 mt-2 max-w-52">{message}</p>
  </div>
);

const MiniMeter = ({ value = 0, label, color = 'bg-primary' }) => (
  <div>
    <div className="flex justify-between text-xs mb-1 text-gray-300 uppercase font-semibold"><span>{label}</span><span>{value}%</span></div>
    <div className="h-3 bg-graphite rounded overflow-hidden">
      <div className={`h-full ${color}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  </div>
);

export const GameStatsCharts = ({ reviewStats, analyticsStats, analyticsUnavailable }) => {
  const ratingDistribution = reviewStats?.distribution || [];

  const hasRatingDistribution = ratingDistribution.length > 0;
  const completionRate = analyticsStats?.completionRate;
  const hasCompletionRate = Number.isFinite(completionRate);

  const totalGames = analyticsStats?.totalGames || 0;
  const totalPlaytimeHours = analyticsStats?.totalPlaytimeHours || 0;
  const averagePlaytime = totalGames > 0 ? Number((totalPlaytimeHours / totalGames).toFixed(1)) : null;

  const maxBucket = Math.max(...ratingDistribution.map((item) => item.count), 1);

  return (
    <section className="bg-navy border-2 border-graphite rounded p-6 mb-8">
      <h2 className="text-lg font-bold uppercase text-white mb-4">Game Stats</h2>
      <div className="grid lg:grid-cols-2 gap-4">
        {hasRatingDistribution ? (
          <div className="bg-graphite/30 border border-graphite rounded p-4">
            <p className="text-xs font-bold uppercase text-gray-300 mb-3">Rating distribution</p>
            <div className="space-y-2">
              {ratingDistribution.map((item) => (
                <MiniMeter key={item.rating} label={`${item.rating}★`} value={(item.count / maxBucket) * 100} />
              ))}
            </div>
          </div>
        ) : (
          <EmptyState title="Rating distribution" message="No game-level rating data yet. This chart appears once players submit ratings." />
        )}

        {averagePlaytime != null ? (
          <div className="bg-graphite/30 border border-graphite rounded p-4">
            <p className="text-xs font-bold uppercase text-gray-300 mb-3">Average playtime</p>
            <MiniMeter label="Avg playtime toward 100h" value={averagePlaytime} color="bg-green-500" />
            <p className="text-center mt-3 text-primary font-bold">{averagePlaytime}h</p>
          </div>
        ) : (
          <EmptyState title="Average playtime" message="No tracked playtime available yet for this game context." />
        )}

        {hasCompletionRate ? (
          <div className="bg-graphite/30 border border-graphite rounded p-4">
            <p className="text-xs font-bold uppercase text-gray-300 mb-3">Completion rate</p>
            <MiniMeter label="Completed" value={completionRate} color="bg-primary" />
            <p className="text-center mt-3 text-primary font-bold">{completionRate}%</p>
          </div>
        ) : (
          <EmptyState title="Completion rate" message="Completion data is unavailable for this game right now." />
        )}

        <EmptyState
          title="Active players this week"
          message={analyticsUnavailable
            ? 'Could not load activity data. Sign in to view player activity when available.'
            : 'Weekly active-player data is not available from the current analytics endpoint.'}
        />
      </div>
    </section>
  );
};
