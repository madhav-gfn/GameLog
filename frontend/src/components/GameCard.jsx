import React from 'react';
import { RatingStars } from './RatingStars';
import { StatusBadge } from './StatusBadge';

export const GameCard = ({ game, onClick, compact = false }) => {
  if (compact) {
    return (
      <div
        onClick={onClick}
        className="group cursor-pointer card card-hover overflow-hidden"
      >
        <div className="relative overflow-hidden aspect-video bg-light-bg-secondary dark:bg-dark-bg-secondary">
          <img
            src={game.coverImage || game.cover}
            alt={game.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="256" height="144"%3E%3Crect fill="%23E5E5E5" width="256" height="144"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-family="sans-serif" font-size="14"%3ENo Image%3C/text%3E%3C/svg%3E';
            }}
          />
        </div>
        <div className="p-3">
          <h3 className="text-xs font-bold text-light-text-primary dark:text-dark-text-primary truncate">
            {game.title}
          </h3>
          {game.releaseYear && (
            <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary mt-1">{game.releaseYear}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer card card-hover overflow-hidden"
    >
      {/* Card Image */}
      <div className="relative overflow-hidden aspect-video bg-light-bg-secondary dark:bg-dark-bg-secondary">
        <img
          src={game.coverImage || game.cover}
          alt={game.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="256" height="144"%3E%3Crect fill="%23E5E5E5" width="256" height="144"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-family="sans-serif" font-size="14"%3ENo Image%3C/text%3E%3C/svg%3E';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Card Content */}
      <div className="p-4">
        <h3 className="text-sm font-bold text-light-text-primary dark:text-dark-text-primary mb-2 line-clamp-2 group-hover:text-light-accent-primary dark:group-hover:text-dark-accent-primary transition-colors">
          {game.title}
        </h3>

        <div className="flex items-center justify-between mb-3">
          {game.releaseYear && (
            <span className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">{game.releaseYear}</span>
          )}
          <RatingStars rating={game.averageRating} size="sm" />
        </div>

        {/* Platforms */}
        {game.platforms && (
          <div className="flex gap-1 flex-wrap mb-3">
            {game.platforms.map((platform) => (
              <span
                key={platform}
                className="text-xs px-2 py-1 bg-light-accent-primary/10 dark:bg-dark-accent-primary/20 text-light-accent-primary dark:text-dark-accent-primary rounded border border-light-accent-primary/20 dark:border-dark-accent-primary/30"
              >
                {platform}
              </span>
            ))}
          </div>
        )}

        {/* Genres */}
        {game.genres && (
          <div className="flex gap-1 flex-wrap">
            {game.genres.slice(0, 2).map((genre) => (
              <span
                key={genre}
                className="text-xs px-2 py-1 bg-light-accent-secondary/10 dark:bg-dark-accent-secondary/20 text-light-accent-secondary dark:text-dark-accent-secondary rounded"
              >
                {genre}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
