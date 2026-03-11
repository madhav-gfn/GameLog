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

    // Get user's activity feed
    async getUserActivity(userId, params = {}) {
        return api.get(`/users/${userId}/activity`, { params });
    },
};
