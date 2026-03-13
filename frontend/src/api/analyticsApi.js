import { api } from './axios.js';

export const analyticsApi = {
    // Get combined analytics overview
    async getOverview(params = {}) {
        return api.get('/analytics/overview', { params });
    },

    // Get playtime stats via overview.games to keep one canonical analytics contract
    async getPlaytimeStats(params = {}) {
        const overview = await api.get('/analytics/overview', { params });
        return overview.games;
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
