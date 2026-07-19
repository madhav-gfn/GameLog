import React, { useEffect, useState } from 'react';
import { useReviews } from '../hooks/useReviews';
import { ReviewComments } from './ReviewComments';

export const ReviewList = ({ gameId }) => {
    const { reviews, fetchGameReviews, likeReview, loading } = useReviews();
    const [openCommentsId, setOpenCommentsId] = useState(null);

    useEffect(() => {
        if (gameId) {
            fetchGameReviews(gameId);
        }
    }, [gameId, fetchGameReviews]);

    if (loading) return <div className="text-gray-400 font-bold uppercase">Loading reviews...</div>;

    if (reviews.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500 bg-graphite/20 rounded font-bold uppercase">
                No reviews yet. Be the first to share your thoughts!
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-white uppercase tracking-wider mb-4">Community Reviews</h3>
            {reviews.map(review => (
                <div key={review.id} className="bg-graphite/30 border-2 border-graphite rounded p-4">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-navy font-bold">
                                {review.user.avatar ? (
                                    <img src={review.user.avatar} alt={review.user.username} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    review.user.username[0].toUpperCase()
                                )}
                            </div>
                            <div>
                                <div className="font-bold text-white uppercase text-sm">
                                    {review.user.displayName || review.user.username}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    </div>

                    <p className="text-gray-300 mb-3">{review.content}</p>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => likeReview(review.id)}
                            aria-pressed={Boolean(review.likedByMe)}
                            className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-bold uppercase tracking-wide transition-colors ${
                                review.likedByMe
                                    ? 'border-primary bg-primary/15 text-primary'
                                    : 'border-gray-700 text-gray-300 hover:border-primary hover:text-primary'
                            }`}
                        >
                            <span className="material-symbols-outlined text-lg leading-none">favorite</span>
                            {review.likes ?? review._count?.likes ?? 0} {review.likedByMe ? 'Liked' : 'Like'}
                        </button>

                        <button
                            onClick={() => setOpenCommentsId((current) => (current === review.id ? null : review.id))}
                            aria-expanded={openCommentsId === review.id}
                            className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-bold uppercase tracking-wide transition-colors ${
                                openCommentsId === review.id
                                    ? 'border-primary bg-primary/15 text-primary'
                                    : 'border-gray-700 text-gray-300 hover:border-primary hover:text-primary'
                            }`}
                        >
                            <span className="material-symbols-outlined text-lg leading-none">chat_bubble</span>
                            {review._count?.comments ?? 0} {(review._count?.comments ?? 0) === 1 ? 'Comment' : 'Comments'}
                        </button>
                    </div>

                    {openCommentsId === review.id && <ReviewComments reviewId={review.id} />}
                </div>
            ))}
        </div>
    );
};
