import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { reviewApi } from '../api/reviewApi';

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name=Player&background=111827&color=ffffff';

const formatCommentDate = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

/**
 * Comment thread + composer for a review.
 * @param {{reviewId: string, onCountChange?: (count:number)=>void}} props
 */
export const ReviewComments = ({ reviewId, onCountChange }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState(null);
  const [draft, setDraft] = useState('');

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await reviewApi.getReviewComments(reviewId, { limit: 50 });
      const list = response?.comments || response?.data?.comments || [];
      setComments(list);
      onCountChange?.(response?.pagination?.total ?? list.length);
    } catch (err) {
      setError(err.message || 'Failed to load comments');
    } finally {
      setLoading(false);
    }
  }, [reviewId, onCountChange]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content || posting) return;

    try {
      setPosting(true);
      setError(null);
      const response = await reviewApi.addReviewComment(reviewId, content);
      const created = response?.data || response;
      const fallback = {
        id: `local-${Date.now()}`,
        content,
        createdAt: new Date().toISOString(),
        user: { id: user?.id, username: user?.username, displayName: user?.displayName, avatar: user?.avatar },
      };
      setComments((prev) => {
        const next = [...prev, created?.content ? created : fallback];
        onCountChange?.(next.length);
        return next;
      });
      setDraft('');
    } catch (err) {
      setError(err.message || 'Failed to post comment');
    } finally {
      setPosting(false);
    }
  };

  const openProfile = (commentUser) => {
    if (commentUser?.id) navigate(`/profile?user=${commentUser.id}`);
  };

  return (
    <div className="mt-3 rounded-lg border border-gray-800 bg-gray-900/40 p-3">
      {loading && <p className="text-xs text-gray-500 py-2">Loading comments...</p>}

      {!loading && comments.length === 0 && (
        <p className="text-xs text-gray-500 py-2">No comments yet. Start the conversation!</p>
      )}

      {!loading && comments.length > 0 && (
        <ul className="space-y-3 max-h-72 overflow-y-auto pr-1">
          {comments.map((comment) => (
            <li key={comment.id} className="flex items-start gap-2.5">
              <button type="button" onClick={() => openProfile(comment.user)} className="shrink-0" title="View profile">
                <img
                  src={comment.user?.avatar || DEFAULT_AVATAR}
                  alt={`${comment.user?.displayName || comment.user?.username || 'Player'} avatar`}
                  className="w-8 h-8 rounded-full object-cover border border-gray-700"
                />
              </button>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <button
                    type="button"
                    onClick={() => openProfile(comment.user)}
                    className="text-xs font-bold text-white hover:text-primary transition-colors"
                  >
                    {comment.user?.displayName || comment.user?.username || 'Player'}
                  </button>
                  <span className="text-[11px] text-gray-500">{formatCommentDate(comment.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-300 break-words">{comment.content}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}

      <form onSubmit={handleSubmit} className="mt-3 flex items-center gap-2">
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Write a comment..."
          maxLength={2000}
          className="flex-1 min-w-0 rounded-lg border border-gray-700 bg-background-dark/70 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-primary focus:outline-none transition-colors"
        />
        <button
          type="submit"
          disabled={posting || !draft.trim()}
          className="shrink-0 rounded-lg bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wide text-navy transition-colors hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {posting ? '...' : 'Post'}
        </button>
      </form>
    </div>
  );
};
