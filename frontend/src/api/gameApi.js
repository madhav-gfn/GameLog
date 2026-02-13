import { api } from './axios.js';

export const gameApi = {
  // Fetch games with filters
  async getGames(filters = {}) {
    // Axios handles param serialization automatically
    const response = await api.get('/games', { params: filters });
    return response;
  },

  // Fetch available genres
  async getGenres() {
    return api.get('/games/genres');
  },

  // Fetch available platforms
  async getPlatforms() {
    return api.get('/games/platforms');
  },

  // Fetch user activity
  async getUserActivity(userId) {
    return api.get(`/users/${userId}/activity`);
  },

  // Fetch game details
  async getGameDetail(gameId) {
    return api.get(`/games/${gameId}`);
  },

  // Add game to library
  async addGameToLibrary(gameId, { status, rating, review }) {
    return api.post(`/games/${gameId}/library`, { status, rating, review });
  },

  // Get game from library (for user context)
  async getGameFromLibrary() {
    // This is often implicitly handled by getGameDetail if backend supports it, 
    // or fetched via user library endpoint. Using the user library endpoint for now if available, 
    // or relying on what's available. 
    // Assuming backend endpoint exists or is handled elsewhere. 
    // If not, we might need to fetch user's full library or specific check.
    // For now, let's assume we use the user endpoint or handle it in component.
    // Wait, the backend doesn't have a direct 'get one game from library' endpoint except via user games list.
    // But we can check status via `getGameDetail` if it returns user specific info (it usually doesn't for public cache).
    // The `addGameToLibrary` returns the UserGame object.
    return null;
  }
};
