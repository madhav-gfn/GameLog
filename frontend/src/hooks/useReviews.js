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
            const result = await reviewApi.likeReview(reviewId);
            setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, likes: result.data.likes } : r));
        } catch (err) {
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
