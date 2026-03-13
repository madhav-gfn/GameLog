import React from 'react';
import { RatingStars } from './RatingStars';

/**
 * @typedef {{type:'LOG',id:string,user:{username:string,displayName?:string,avatar?:string},game?:{title:string,coverImage?:string},status?:string,platform?:string,playtimeHours?:number,progressPercent?:number,rating?:number,timestamp:string}} FeedLogItem
 * @typedef {{type:'REVIEW',id:string,user:{username:string,displayName?:string,avatar?:string},game?:{title:string,coverImage?:string},content?:string,rating?:number,likeCount?:number,timestamp:string}} FeedReviewItem
 * @typedef {FeedLogItem | FeedReviewItem} FeedItem
 */

/** @param {{item: FeedItem, onOpenGame?: (game:any)=>void}} props */
export const FeedCard = ({ item, onOpenGame }) => {
  const handleKeyDown = (event) => {
    if ((event.key === 'Enter' || event.key === ' ') && item.game && onOpenGame) {
      event.preventDefault();
      onOpenGame(item.game);
    }
  };

  return (
    <article className="card p-4" aria-label={`Feed item from ${item.user.displayName || item.user.username}`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-bold text-white">{item.user.displayName || item.user.username}</p>
        <span className="text-xs text-gray-500">{new Date(item.timestamp).toLocaleDateString()}</span>
      </div>

      {item.game && (
        <button
          onClick={() => onOpenGame?.(item.game)}
          onKeyDown={handleKeyDown}
          className="flex gap-3 items-center mb-3 w-full text-left focus-visible:ring-2 focus-visible:ring-primary rounded"
          aria-label={`Open ${item.game.title}`}
        >
          {item.game.coverImage && <img src={item.game.coverImage} alt={item.game.title} className="w-12 h-16 rounded object-cover" />}
          <span className="font-semibold text-primary text-sm">{item.game.title}</span>
        </button>
      )}

      {item.type === 'REVIEW' ? (
        <>
          {item.rating ? <RatingStars rating={item.rating} /> : null}
          <p className="text-sm text-gray-300 mt-2">{item.content || 'No review text provided.'}</p>
        </>
      ) : (
        <div className="text-sm text-gray-300 space-y-1">
          <p>Status: <span className="text-white font-semibold">{item.status || 'Updated log'}</span></p>
          {item.progressPercent != null && <p>Progress: {item.progressPercent}%</p>}
          {item.playtimeHours != null && <p>Playtime: {item.playtimeHours}h</p>}
        </div>
      )}
    </article>
  );
};
