import React from 'react';
import { useNavigate } from 'react-router-dom';

export const TopRated = ({ games = [], title = 'Top Rated' }) => {
  const navigate = useNavigate();

  if (!games || games.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">
        {title}
      </h2>
      <div className="space-y-3">
        {games.slice(0, 4).map((game, index) => (
          <div
            key={game.id}
            onClick={() => navigate(`/game/${game.id}`)}
            className="card card-hover p-3 cursor-pointer flex items-center gap-3"
          >
            <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden bg-light-bg-secondary dark:bg-dark-bg-secondary">
              <img
                src={game.coverImage || game.cover || '/placeholder-game.jpg'}
                alt={game.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48"%3E%3Crect fill="%23E5E5E5" width="48" height="48"/%3E%3C/svg%3E';
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-light-text-primary dark:text-dark-text-primary truncate">
                {game.title}
              </h3>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary">
                {game.averageRating ? Math.round(game.averageRating) : 'N/A'}
              </span>
              <svg className="w-4 h-4 text-light-accent-secondary dark:text-dark-accent-secondary" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.667v5.833a1.5 1.5 0 001.5 1.5h1a1.5 1.5 0 001.5-1.5V10.667a1.5 1.5 0 00-1.5-1.5h-1a1.5 1.5 0 00-1.5 1.5zM12.5 10.5a1.5 1.5 0 013 0v6a1.5 1.5 0 01-3 0v-6zM16 8.667v7.833a1.5 1.5 0 001.5 1.5h1a1.5 1.5 0 001.5-1.5V8.667a1.5 1.5 0 00-1.5-1.5h-1a1.5 1.5 0 00-1.5 1.5z" />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
