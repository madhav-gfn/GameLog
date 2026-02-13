import { api } from './axios.js';

export const followApi = {
    // Follow a user
    async followUser(userId) {
        return api.post(`/follow/${userId}`);
    },

    // Unfollow a user
    async unfollowUser(userId) {
        return api.delete(`/follow/${userId}`);
    },

    // Get followers of a user
    async getFollowers(userId, params = {}) {
        return api.get(`/follow/${userId}/followers`, { params });
    },

    // Get users followed by a user
    async getFollowing(userId, params = {}) {
        return api.get(`/follow/${userId}/following`, { params });
    },

    // Check if following a specific user
    async checkFollowStatus(userId) {
        return api.get(`/follow/status/${userId}`);
    },

    // Get social feed (activities of followed users)
    async getSocialFeed(params = {}) {
        return api.get('/follow/feed', { params });
    },
};
