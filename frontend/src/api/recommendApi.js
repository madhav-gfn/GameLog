import { api } from './axios.js';

export const recommendApi = {
  /**
   * Get 3 game recommendations based on quiz answers.
   * @param {Object} answers - { mood, timeAvailable, genre, playStyle, platform, isStreamer }
   */
  async getRecommendations(answers) {
    const response = await api.post('/recommend', { answers });
    return response; // axios interceptor already unwraps response.data
  },
};
