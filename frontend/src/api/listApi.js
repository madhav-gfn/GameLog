import { api } from './axios.js';

export const listApi = {
    // Create a new list
    async createList(data) {
        return api.post('/lists', data);
    },

    // Get user's lists
    async getUserLists(userId) {
        return api.get(`/lists/user/${userId}`);
    },

    // Get a single list detail
    async getListById(id) {
        return api.get(`/lists/${id}`);
    },

    // Update a list
    async updateList(id, data) {
        return api.put(`/lists/${id}`, data);
    },

    // Delete a list
    async deleteList(id) {
        return api.delete(`/lists/${id}`);
    },

    // Add a game to a list
    async addGameToList(listId, data) {
        return api.post(`/lists/${listId}/items`, data);
    },

    // Remove a game from a list
    async removeGameFromList(listId, gameId) {
        return api.delete(`/lists/${listId}/items/${gameId}`);
    },

    // Reorder items in a list
    async reorderListItems(listId, items) {
        return api.put(`/lists/${listId}/items/reorder`, { items });
    },
};
