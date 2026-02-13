import axios from 'axios';
import { API_URL } from '../config/env.js';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Important for session cookies (Google OAuth)
});

// Request interceptor: Attach token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor: Global error handling
api.interceptors.response.use(
    (response) => response.data, // Return data directly for convenience
    (error) => {
        // Optional: Handle 401 Unauthorized globally (e.g., clear token, redirect to login)
        // if (error.response && error.response.status === 401) {
        //   localStorage.removeItem('token');
        //   localStorage.removeItem('user');
        //   window.location.href = '/login';
        // }

        // Extract error message from backend response
        const data = error.response?.data;
        const message = data?.details
            ? `${data.error || 'Error'}: ${data.details}`
            : (data?.error || data?.message || 'Something went wrong');
        const enhancedError = new Error(message);
        enhancedError.status = error.response?.status;
        enhancedError.originalError = error;

        return Promise.reject(enhancedError);
    }
);
