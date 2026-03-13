import { api } from './axios.js';

export const userApi = {
    // Get user profile with stats
    async getUserProfile(userId) {
        return api.get(`/users/${userId}`);
    },

    // Get user's game library
    async getUserLibrary(userId, params = {}) {
        return api.get(`/users/${userId}/library`, { params });
    },

    // Get authenticated user's social activity feed from existing follow endpoint
    // userId is kept for backwards compatibility and intentionally ignored.
    async getUserActivity(_userId, params = {}) {
        return api.get('/follow/feed', { params });
    },
};
