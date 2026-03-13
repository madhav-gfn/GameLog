import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const EmptyState = ({ title, message }) => (
  <div className="bg-graphite/40 border border-graphite rounded p-4 min-h-44 flex flex-col justify-center items-center text-center">
    <p className="text-sm font-bold text-white uppercase tracking-wide">{title}</p>
    <p className="text-xs text-gray-400 mt-2 max-w-52">{message}</p>
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

  const ratingDistributionData = {
    labels: ratingDistribution.map((item) => `${item.rating}★`),
    datasets: [
      {
        label: 'Ratings',
        data: ratingDistribution.map((item) => item.count),
        backgroundColor: '#F6C945',
        borderColor: '#D8A72B',
        borderWidth: 1,
      },
    ],
  };

  const completionRateData = {
    labels: ['Completed', 'Remaining'],
    datasets: [
      {
        data: [completionRate ?? 0, completionRate != null ? 100 - completionRate : 100],
        backgroundColor: ['#F6C945', '#2C2F3A'],
        borderWidth: 0,
      },
    ],
  };

  const averagePlaytimeData = {
    labels: ['Average playtime', 'Remaining to 100h'],
    datasets: [
      {
        data: [averagePlaytime ?? 0, averagePlaytime != null ? Math.max(0, 100 - averagePlaytime) : 100],
        backgroundColor: ['#22C55E', '#2C2F3A'],
        borderWidth: 0,
      },
    ],
  };

  return (
    <section className="bg-navy border-2 border-graphite rounded p-6 mb-8">
      <h2 className="text-lg font-bold uppercase text-white mb-4">Game Stats</h2>
      <div className="grid lg:grid-cols-2 gap-4">
        {hasRatingDistribution ? (
          <div className="bg-graphite/30 border border-graphite rounded p-4">
            <p className="text-xs font-bold uppercase text-gray-300 mb-3">Rating distribution</p>
            <Bar
              data={ratingDistributionData}
              options={{
                plugins: { legend: { display: false } },
                scales: {
                  x: { ticks: { color: '#9CA3AF' }, grid: { color: '#3A3D49' } },
                  y: { ticks: { color: '#9CA3AF' }, grid: { color: '#3A3D49' }, beginAtZero: true },
                },
              }}
            />
          </div>
        ) : (
          <EmptyState title="Rating distribution" message="No game-level rating data yet. This chart appears once players submit ratings." />
        )}

        {averagePlaytime != null ? (
          <div className="bg-graphite/30 border border-graphite rounded p-4">
            <p className="text-xs font-bold uppercase text-gray-300 mb-3">Average playtime</p>
            <div className="max-w-40 mx-auto">
              <Doughnut data={averagePlaytimeData} options={{ plugins: { legend: { display: false } } }} />
            </div>
            <p className="text-center mt-3 text-primary font-bold">{averagePlaytime}h</p>
          </div>
        ) : (
          <EmptyState title="Average playtime" message="No tracked playtime available yet for this game context." />
        )}

        {hasCompletionRate ? (
          <div className="bg-graphite/30 border border-graphite rounded p-4">
            <p className="text-xs font-bold uppercase text-gray-300 mb-3">Completion rate</p>
            <div className="max-w-40 mx-auto">
              <Doughnut data={completionRateData} options={{ plugins: { legend: { display: false } } }} />
            </div>
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
