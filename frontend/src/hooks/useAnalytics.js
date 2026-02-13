import { useState, useCallback } from 'react';
import { analyticsApi } from '../api/analyticsApi.js';

export const useAnalytics = () => {
    const [overview, setOverview] = useState(null);
    const [playtime, setPlaytime] = useState(null);
    const [gameStats, setGameStats] = useState(null);
    const [genres, setGenres] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchOverview = useCallback(async (params) => {
        setLoading(true);
        try {
            const response = await analyticsApi.getOverview(params);
            setOverview(response.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchPlaytime = useCallback(async (params) => {
        setLoading(true);
        try {
            const response = await analyticsApi.getPlaytimeStats(params);
            setPlaytime(response.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchGameStats = useCallback(async (params) => {
        setLoading(true);
        try {
            const response = await analyticsApi.getGameStats(params);
            setGameStats(response.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchGenres = useCallback(async (params) => {
        setLoading(true);
        try {
            const response = await analyticsApi.getGenreBreakdown(params);
            setGenres(response.data.genres); // Check response structure
            // Backend: keys are dynamic? No, returns array of objects { genre, gameCount, totalHours }
            // Wait, backend response for getGenreBreakdown is array directly?
            // Service: `return Object.values(genreMap).map(...)` -> Array.
            // Controller: `res.json(genres)` -> Array.
            // So response is array. Axios interceptor returns response.data (which is the array).
            // So `response` IS the array.
            // Wait, `api/analytics/genres` returns `res.json(genres)`.
            // `api.get` returns `response.data`.
            // So `response` is the array.
            // BUT `overview` returns `{ playtime, games, genres }`.
            setGenres(response);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        overview,
        playtime,
        gameStats,
        genres,
        loading,
        error,
        fetchOverview,
        fetchPlaytime,
        fetchGameStats,
        fetchGenres
    };
};
