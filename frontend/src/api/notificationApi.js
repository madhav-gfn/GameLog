import { api } from './axios.js';

export const notificationApi = {
  async getNotifications(params = {}) {
    return api.get('/notifications', { params });
  },
  async markAsRead(id) {
    return api.put(`/notifications/${id}/read`);
  },
  async markAllAsRead() {
    return api.put('/notifications/read-all');
  },
};
