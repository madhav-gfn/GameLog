import React, { useEffect } from 'react';
import { useReviews } from '../hooks/useReviews';

export const ReviewList = ({ gameId }) => {
    const { reviews, fetchGameReviews, likeReview, loading } = useReviews();

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

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                        <button
                            onClick={() => likeReview(review.id)}
                            className="flex items-center gap-1 hover:text-primary transition-colors font-bold"
                        >
                            ❤️ {review.likes} Likes
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};
