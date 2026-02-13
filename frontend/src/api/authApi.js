import { api } from './axios.js';

export const authApi = {
    async signup({ username, email, password, displayName }) {
        // api.post returns response.data directly due to interceptor
        const data = await api.post('/auth/signup', { username, email, password, displayName });
        return data;
    },

    async signin({ email, password }) {
        const data = await api.post('/auth/signin', { email, password });
        return data;
    },

    async signout() {
        await api.post('/auth/signout');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    async getMe() {
        try {
            const token = localStorage.getItem('token');
            // Optimistic check to avoid call if no token
            if (!token) return null;

            const user = await api.get('/auth/me');
            return user;
        } catch {
            // If 401/403, just return null (not authenticated)
            return null;
        }
    },
};
