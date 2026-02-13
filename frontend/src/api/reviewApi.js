import { api } from './axios.js';

export const reviewApi = {
    // Get reviews for a game
    async getGameReviews(gameId, params = {}) {
        return api.get(`/reviews/game/${gameId}`, { params });
    },

    // Get review stats for a game
    async getReviewStats(gameId) {
        return api.get(`/reviews/game/${gameId}/stats`);
    },

    // Get reviews by a user
    async getUserReviews(userId, params = {}) {
        return api.get(`/reviews/user/${userId}`, { params });
    },

    // Create or update a review
    async createReview(gameId, data) {
        return api.post(`/reviews/game/${gameId}`, data);
    },

    // Like a review
    async likeReview(reviewId) {
        return api.post(`/reviews/${reviewId}/like`);
    },
};
