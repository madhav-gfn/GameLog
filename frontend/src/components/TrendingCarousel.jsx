import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export const TrendingCarousel = ({ games = [], title = 'Trending Now' }) => {
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (!games || games.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
          {title}
        </h2>
        <button
          onClick={() => scroll('right')}
          className="p-2 rounded-full bg-light-bg-card dark:bg-dark-bg-card border border-light-border-default dark:border-dark-border-default hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-colors"
          aria-label="Scroll right"
        >
          <svg className="w-5 h-5 text-light-text-primary dark:text-dark-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      <div className="relative">
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {games.map((game) => (
            <div
              key={game.id}
              onClick={() => navigate(`/game/${game.id}`)}
              className="flex-shrink-0 w-64 cursor-pointer group"
            >
              <div className="card card-hover overflow-hidden">
                <div className="relative aspect-[3/4] overflow-hidden bg-light-bg-secondary dark:bg-dark-bg-secondary">
                  <img
                    src={game.coverImage || game.cover || '/placeholder-game.jpg'}
                    alt={game.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="256" height="384"%3E%3Crect fill="%23E5E5E5" width="256" height="384"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-family="sans-serif" font-size="16"%3ENo Image%3C/text%3E%3C/svg%3E';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-light-text-primary dark:text-dark-text-primary line-clamp-2 group-hover:text-light-accent-primary dark:group-hover:text-dark-accent-primary transition-colors">
                    {game.title}
                  </h3>
                  {game.releaseYear && (
                    <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary mt-1">
                      {game.releaseYear}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
