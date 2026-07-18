import { useState, useCallback } from 'react';
import { reviewApi } from '../api/reviewApi.js';

export const useReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchGameReviews = useCallback(async (gameId, params) => {
        setLoading(true);
        try {
            const response = await reviewApi.getGameReviews(gameId, params);
            setReviews(response.reviews);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchReviewStats = useCallback(async (gameId) => {
        try {
            const response = await reviewApi.getReviewStats(gameId);
            setStats(response.data);
        } catch (err) {
            console.error(err);
        }
    }, []);

    const createReview = async (gameId, data) => {
        setLoading(true);
        try {
            const result = await reviewApi.createReview(gameId, data);
            // Optimistically add to reviews if it's a new review
            // But review upsert returns the review.
            // If it's an update, we should replace.
            // Simplified: just refetch or rely on caller to refetch.
            return result.data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const likeReview = async (reviewId) => {
        try {
            const currentReview = reviews.find((review) => review.id === reviewId);
            const shouldUnlike = Boolean(currentReview?.likedByMe);
            let result = shouldUnlike
                ? await reviewApi.unlikeReview(reviewId)
                : await reviewApi.likeReview(reviewId);

            const nextLikes = result?.data?.likes ?? result?.data?.likeCount;

            setReviews((prev) => prev.map((review) => {
                if (review.id !== reviewId) return review;
                return {
                    ...review,
                    likes: typeof nextLikes === 'number'
                        ? nextLikes
                        : (review.likes ?? review._count?.likes ?? 0),
                    likedByMe: !shouldUnlike,
                };
            }));
        } catch (err) {
            if (err?.status === 409) {
                try {
                    const result = await reviewApi.unlikeReview(reviewId);
                    const nextLikes = result?.data?.likes ?? result?.data?.likeCount;
                    setReviews((prev) => prev.map((review) => {
                        if (review.id !== reviewId) return review;
                        return {
                            ...review,
                            likes: typeof nextLikes === 'number'
                                ? nextLikes
                                : Math.max((review.likes ?? review._count?.likes ?? 1) - 1, 0),
                            likedByMe: false,
                        };
                    }));
                    return;
                } catch (unlikeErr) {
                    setError(unlikeErr.message);
                    return;
                }
            }
            setError(err.message);
        }
    };

    return {
        reviews,
        stats,
        loading,
        error,
        fetchGameReviews,
        fetchReviewStats,
        createReview,
        likeReview
    };
};
