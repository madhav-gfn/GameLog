import React from 'react';
import { RatingStars } from './RatingStars';
import { StatusBadge } from './StatusBadge';

export const GameCard = ({ game, onClick, compact = false }) => {
  if (compact) {
    return (
      <div
        onClick={onClick}
        className="group cursor-pointer rounded-lg overflow-hidden bg-retro-purple border border-retro-neon-blue/30 hover:border-retro-neon-blue hover:shadow-neon-blue transition-all duration-300"
      >
        <div className="relative overflow-hidden aspect-video bg-gray-900">
          <img
            src={game.coverImage || game.cover}
            alt={game.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        </div>
        <div className="p-3">
          <h3 className="text-xs font-bold text-retro-neon-green truncate">
            {game.title}
          </h3>
          <p className="text-xs text-gray-400 mt-1">{game.releaseYear}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer rounded-xl overflow-hidden bg-gradient-to-b from-retro-purple to-retro-dark border border-retro-neon-blue/30 hover:border-retro-neon-magenta/50 hover:shadow-neon-magenta transition-all duration-300"
    >
      {/* Card Image */}
      <div className="relative overflow-hidden aspect-video bg-gray-900">
        <img
          src={game.coverImage || game.cover}
          alt={game.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Card Content */}
      <div className="p-4">
        <h3 className="text-sm font-bold text-retro-neon-green mb-2 line-clamp-2">
          {game.title}
        </h3>

        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-gray-400 font-mono">{game.releaseYear}</span>
          <RatingStars rating={game.averageRating} size="sm" />
        </div>

        {/* Platforms */}
        {game.platforms && (
          <div className="flex gap-1 flex-wrap mb-3">
            {game.platforms.map((platform) => (
              <span
                key={platform}
                className="text-xs px-2 py-1 bg-retro-neon-blue/20 text-retro-neon-blue rounded border border-retro-neon-blue/40"
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
                className="text-xs px-2 py-1 bg-retro-neon-magenta/20 text-retro-neon-magenta rounded"
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
