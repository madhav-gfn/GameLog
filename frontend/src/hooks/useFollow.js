import { useState, useCallback } from 'react';
import { followApi } from '../api/followApi.js';

export const useFollow = () => {
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [feed, setFeed] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchFollowers = useCallback(async (userId) => {
        setLoading(true);
        try {
            const response = await followApi.getFollowers(userId);
            setFollowers(response.data.users);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchFollowing = useCallback(async (userId) => {
        setLoading(true);
        try {
            const response = await followApi.getFollowing(userId);
            setFollowing(response.data.users);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchFeed = useCallback(async () => {
        setLoading(true);
        try {
            const response = await followApi.getSocialFeed();
            setFeed(response.activities); // Adjust based on actual API response structure (response.data.activities?)
            // backend: res.json({ success: true, activities: ... })
            // axios interceptor returns response.data -> { success: true, activities: ... }
            // So above is correct: response.activities
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const followUser = async (userId) => {
        try {
            await followApi.followUser(userId);
            // Ideally refetch or update state
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const unfollowUser = async (userId) => {
        try {
            await followApi.unfollowUser(userId);
            setFollowing(prev => prev.filter(u => u.id !== userId));
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const checkFollowStatus = async (userId) => {
        try {
            const response = await followApi.checkFollowStatus(userId);
            return response.isFollowing;
        } catch {
            return false;
        }
    };

    return {
        followers,
        following,
        feed,
        loading,
        error,
        fetchFollowers,
        fetchFollowing,
        fetchFeed,
        followUser,
        unfollowUser,
        checkFollowStatus
    };
};
