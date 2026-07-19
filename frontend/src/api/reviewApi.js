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

    // Get comments for a review
    async getReviewComments(reviewId, params = {}) {
        return api.get(`/reviews/${reviewId}/comments`, { params });
    },

    // Add a comment to a review
    async addReviewComment(reviewId, content) {
        return api.post(`/reviews/${reviewId}/comments`, { content });
    },

    // Like a review
    async likeReview(reviewId) {
        return api.post(`/reviews/${reviewId}/like`);
    },

    // Unlike a review
    async unlikeReview(reviewId) {
        return api.delete(`/reviews/${reviewId}/like`);
    },
};
