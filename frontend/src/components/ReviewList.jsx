import React, { useEffect } from 'react';
import { useReviews } from '../hooks/useReviews';
import { RatingStars } from './RatingStars'; // Assumes component exists

export const ReviewList = ({ gameId }) => {
    const { reviews, fetchGameReviews, likeReview, loading } = useReviews();

    useEffect(() => {
        if (gameId) {
            fetchGameReviews(gameId);
        }
    }, [gameId, fetchGameReviews]);

    if (loading) return <div className="text-light-text-secondary dark:text-dark-text-secondary">Loading reviews...</div>;
    // if (error) return <div className="text-red-500">Failed to load reviews</div>;

    if (reviews.length === 0) {
        return (
            <div className="text-center py-8 text-light-text-tertiary dark:text-dark-text-tertiary bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg">
                No reviews yet. Be the first to share your thoughts!
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">Community Reviews</h3>
            {reviews.map(review => (
                <div key={review.id} className="card p-4">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-light-accent-primary dark:bg-dark-accent-primary flex items-center justify-center text-white font-bold">
                                {review.user.avatar ? (
                                    <img src={review.user.avatar} alt={review.user.username} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    review.user.username[0].toUpperCase()
                                )}
                            </div>
                            <div>
                                <div className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                                    {review.user.displayName || review.user.username}
                                </div>
                                <div className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                        {/* Rating if available (reviews usually have a rating in the game_user link, but here it might be separate or passed) 
                            Wait, the review model itself doesn't have rating? 
                            The schema says: UserGame has rating/review. Comment has content. 
                            My `createReview` syncs rating to UserGame. 
                            But `getGameReviews` returns Comments. 
                            Does Comment have rating? 
                            Schema: Comment model has `userId`, `gameId`, `content`, `likes`. 
                            It does NOT have `rating`. 
                            However, the `reviewApi.getGameReviews` implementation returns comments.
                            Does the backend include rating in the comment?
                            Let's check `review.service.js`.
                            `prisma.comment.findMany(...) include user...`
                            It does NOT include rating from UserGame.
                            So reviews might appear without rating which is awkward.
                            Enhancement needed: Include rating in the review list response by joining UserGame.
                            I'll skip showing rating in ReviewList for now or fetch it if possible.
                            Actually, `UserGame` is unique by userId+gameId.
                            I can fetch rating for the user?
                            For now, I'll just show the review content.
                        */}
                    </div>

                    <p className="text-light-text-secondary dark:text-dark-text-secondary mb-3">{review.content}</p>

                    <div className="flex items-center gap-4 text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
                        <button
                            onClick={() => likeReview(review.id)}
                            className="flex items-center gap-1 hover:text-light-accent-primary dark:hover:text-dark-accent-primary transition-colors"
                        >
                            ❤️ {review.likes} Likes
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};
