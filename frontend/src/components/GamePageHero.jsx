import React from 'react';
import { RatingStars } from './RatingStars';

/** @param {{game:any, developers?: Array<{name:string}>, loading?: boolean, error?: string|null}} props */
export const GamePageHero = ({ game, developers = [], loading = false, error = null }) => {
  if (loading) return <div className="mb-8 -mx-8 -mt-8 h-80 bg-graphite animate-pulse" aria-label="Loading game hero" />;
  if (error || !game) return <div className="mb-6 p-4 bg-crimson/20 text-crimson rounded">{error || 'Missing game data.'}</div>;

  return (
    <section className="mb-8 -mx-8 -mt-8" aria-label={`${game.title} hero`}>
      <div className="relative h-80 bg-graphite overflow-hidden">
        <img src={game.cover} alt={`${game.title} backdrop`} className="w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/80 to-transparent" />
        <div className="absolute bottom-6 left-8 right-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-white uppercase tracking-tighter mb-3">{game.title}</h1>
          <div className="flex gap-3 flex-wrap items-center">
            {game.releaseYear && <span className="text-gray-400 font-bold">{game.releaseYear}</span>}
            <RatingStars rating={game.averageRating} />
            {game.ratingCount > 0 && <span className="text-xs text-gray-500">{game.ratingCount} ratings</span>}
            {developers.length > 0 && <span className="text-xs text-primary font-bold uppercase">by {developers.map((d) => d.name).join(', ')}</span>}
          </div>
        </div>
      </div>
    </section>
  );
};
