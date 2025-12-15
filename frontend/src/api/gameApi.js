const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const gameApi = {
  // Fetch games with filters
  async getGames(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.genre) params.append('genre', filters.genre);
    if (filters.platform) params.append('platform', filters.platform);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.page) params.append('page', filters.page);

    const response = await fetch(`${API_URL}/games?${params}`);
    if (!response.ok) throw new Error('Failed to fetch games');
    return response.json();
  },

  // Fetch available genres
  async getGenres() {
    const response = await fetch(`${API_URL}/games/genres`);
    if (!response.ok) throw new Error('Failed to fetch genres');
    return response.json();
  },

  // Fetch available platforms
  async getPlatforms() {
    const response = await fetch(`${API_URL}/games/platforms`);
    if (!response.ok) throw new Error('Failed to fetch platforms');
    return response.json();
  },
};
