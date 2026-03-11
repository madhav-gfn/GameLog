import React from 'react';
import { RatingStars } from './RatingStars';

export const GameCard = ({ game, onClick, compact = false }) => {
  const fallbackSvg = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="256" height="144"%3E%3Crect fill="%232d3748" width="256" height="144"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-family="sans-serif" font-size="14"%3ENo Image%3C/text%3E%3C/svg%3E';

  if (compact) {
    return (
      <div
        onClick={onClick}
        className="group cursor-pointer bg-navy border-2 border-graphite rounded overflow-hidden hover:border-primary transition-colors"
      >
        <div className="relative overflow-hidden aspect-video bg-graphite">
          <img
            src={game.coverImage || game.cover}
            alt={game.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => { e.target.src = fallbackSvg; }}
          />
        </div>
        <div className="p-3">
          <h3 className="text-xs font-bold text-white truncate uppercase group-hover:text-primary transition-colors">
            {game.title}
          </h3>
          {game.releaseYear && (
            <p className="text-xs text-gray-500 mt-1">{game.releaseYear}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer bg-navy border-2 border-graphite rounded overflow-hidden hover:border-primary hover:shadow-glow-yellow transition-all"
    >
      {/* Card Image */}
      <div className="relative overflow-hidden aspect-video bg-graphite">
        <img
          src={game.coverImage || game.cover}
          alt={game.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { e.target.src = fallbackSvg; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Card Content */}
      <div className="p-4">
        <h3 className="text-sm font-bold text-white mb-2 line-clamp-2 uppercase group-hover:text-primary transition-colors">
          {game.title}
        </h3>

        <div className="flex items-center justify-between mb-3">
          {game.releaseYear && (
            <span className="text-xs text-gray-500">{game.releaseYear}</span>
          )}
          <RatingStars rating={game.averageRating} size="sm" />
        </div>

        {/* Platforms */}
        {game.platforms && (
          <div className="flex gap-1 flex-wrap mb-3">
            {game.platforms.slice(0, 3).map((platform) => (
              <span
                key={platform}
                className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded border border-primary/20 font-bold"
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
                className="text-xs px-2 py-0.5 bg-graphite/50 text-gray-400 rounded"
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
