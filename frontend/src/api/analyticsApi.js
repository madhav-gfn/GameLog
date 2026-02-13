import { api } from './axios.js';

export const analyticsApi = {
    // Get combined analytics overview
    async getOverview(params = {}) {
        return api.get('/analytics/overview', { params });
    },

    // Get playtime stats
    async getPlaytimeStats(params = {}) {
        return api.get('/analytics/playtime', { params });
    },

    // Get game stats
    async getGameStats(params = {}) {
        return api.get('/analytics/games', { params });
    },

    // Get genre breakdown
    async getGenreBreakdown(params = {}) {
        return api.get('/analytics/genres', { params });
    },
};
