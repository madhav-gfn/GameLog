import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion as Motion, useReducedMotion } from '../utils/motionCompat';
import { RatingStars } from './RatingStars';
import { ReviewComments } from './ReviewComments';
import {
  coverZoomVariants,
  getTransition,
  hoverCardVariants,
  likeButtonVariants,
} from './animations/variants';

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name=Player&background=111827&color=ffffff';

const actionLabelByType = {
  REVIEW: 'reviewed',
  LOG: 'updated',
};

const formatDate = (timestamp) => {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleString();
};

const formatPlaytime = (hours) => {
  if (hours == null) return '—';
  return `${hours}h`;
};

/** @param {{item:any, onOpenGame?: (game:any)=>void, onToggleLike?: (activityId:string)=>Promise<void>}} props */
export const FeedCard = ({ item, onOpenGame, onToggleLike }) => {
  const reduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const actionVerb = actionLabelByType[item.type] || 'shared';
  const displayName = item.user?.displayName || item.user?.username || 'Unknown Player';
  const username = item.user?.username || 'unknown';
  const [isLikePopping, setIsLikePopping] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(item.commentCount ?? 0);

  useEffect(() => {
    if (!isLikePopping || reduceMotion) return undefined;
    const timer = setTimeout(() => setIsLikePopping(false), 280);
    return () => clearTimeout(timer);
  }, [isLikePopping, reduceMotion]);

  const handleLike = () => {
    if (item.type !== 'REVIEW') return;
    onToggleLike?.(item.id);
    if (!reduceMotion) setIsLikePopping(true);
  };

  const handleViewProfile = () => {
    if (item.user?.id) {
      navigate(`/profile?user=${item.user.id}`);
    }
  };

  return (
    <Motion.article
      initial="rest"
      animate="rest"
      whileHover={reduceMotion ? undefined : 'hover'}
      variants={hoverCardVariants}
      transition={getTransition(reduceMotion, 'hover')}
      className="group card p-4 rounded-xl border border-gray-800/80 hover:border-primary/60 transition-colors"
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={item.user?.avatar || DEFAULT_AVATAR}
            alt={`${displayName} avatar`}
            className="w-11 h-11 rounded-full object-cover border border-gray-700"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-2">
              <span className="font-bold text-white whitespace-nowrap">{displayName}</span>
              <span className="text-gray-400 text-xs">@{username}</span>
              <span className="text-primary font-semibold text-xs uppercase">{actionVerb}</span>
            </div>
            <p className="text-xs text-gray-500">{formatDate(item.timestamp)}</p>
          </div>
        </div>

        <div className="hidden group-hover:flex items-center gap-2">
          {item.user?.id && (
            <button onClick={handleViewProfile} className="text-xs px-2 py-1 rounded bg-gray-800 text-gray-200 hover:bg-primary hover:text-navy transition-colors">
              View profile
            </button>
          )}
        </div>
      </header>

      {item.game && (
        <button
          onClick={() => onOpenGame?.(item.game)}
          className="mt-4 w-full text-left flex gap-3 rounded-lg p-2 bg-gray-900/50 hover:bg-gray-900 transition-colors"
        >
          <Motion.img
            src={item.game.coverImage || 'https://placehold.co/96x128?text=No+Cover'}
            alt={item.game.title || 'Game cover'}
            className="w-16 h-20 rounded object-cover"
            variants={coverZoomVariants}
            transition={getTransition(reduceMotion, 'hover')}
          />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-primary truncate">{item.game.title || 'Unknown title'}</p>
            <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-gray-300">
              <p><span className="text-gray-500">Platform:</span> {item.platform || '—'}</p>
              <p><span className="text-gray-500">Status:</span> {item.status || '—'}</p>
              <p><span className="text-gray-500">Playtime:</span> {formatPlaytime(item.playtimeHours)}</p>
              <p><span className="text-gray-500">Rating:</span> {item.rating ? `${item.rating}/10` : '—'}</p>
            </div>
          </div>
        </button>
      )}

      {item.type === 'REVIEW' && (
        <div className="mt-3 space-y-2">
          {item.rating ? <RatingStars rating={item.rating} /> : null}
          <p className="text-sm text-gray-300 line-clamp-3">{item.content || 'No review excerpt available.'}</p>
        </div>
      )}

      <footer className="mt-4 pt-3 border-t border-gray-800 flex items-center gap-3">
        {item.type === 'REVIEW' ? (
          <>
            <Motion.button
              onClick={handleLike}
              animate={isLikePopping ? 'liked' : 'idle'}
              whileTap={reduceMotion ? undefined : { scale: 0.94 }}
              variants={likeButtonVariants}
              transition={getTransition(reduceMotion, 'like')}
              aria-pressed={Boolean(item.likedByMe)}
              className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-bold uppercase tracking-wide transition-colors ${
                item.likedByMe
                  ? 'border-primary bg-primary/15 text-primary'
                  : 'border-gray-700 text-gray-300 hover:border-primary hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-lg leading-none">favorite</span>
              {item.likeCount ?? 0} {item.likedByMe ? 'Liked' : 'Like'}
            </Motion.button>

            <button
              onClick={() => setShowComments((current) => !current)}
              aria-expanded={showComments}
              className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-bold uppercase tracking-wide transition-colors ${
                showComments
                  ? 'border-primary bg-primary/15 text-primary'
                  : 'border-gray-700 text-gray-300 hover:border-primary hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-lg leading-none">chat_bubble</span>
              {commentCount} {commentCount === 1 ? 'Comment' : 'Comments'}
            </button>
          </>
        ) : (
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Game log update</span>
        )}
      </footer>

      {item.type === 'REVIEW' && showComments && (
        <ReviewComments reviewId={item.id} onCountChange={setCommentCount} />
      )}
    </Motion.article>
  );
};
