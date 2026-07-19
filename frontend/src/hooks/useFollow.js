import { useState, useCallback } from 'react';
import { followApi } from '../api/followApi.js';
import { reviewApi } from '../api/reviewApi.js';
import { normalizeFeedResponse } from '../utils/responseAdapters';

export const useFollow = () => {
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [feed, setFeed] = useState([]);
    const [feedPagination, setFeedPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchFollowers = useCallback(async (userId) => {
        setLoading(true);
        try {
            const response = await followApi.getFollowers(userId);
            setFollowers(response?.data?.users || response?.users || []);
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
            setFollowing(response?.data?.users || response?.users || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchFeed = useCallback(async ({ page = 1, limit = 10, append = false } = {}) => {
        setLoading(true);
        setError(null);
        try {
            const response = await followApi.getSocialFeed({ page, limit });
            const normalized = normalizeFeedResponse(response, page, limit);
            const nextActivities = normalized.activities;
            setFeed((prev) => (append ? [...prev, ...nextActivities] : nextActivities));
            setFeedPagination(normalized.pagination);
            return normalized;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const followUser = async (userId) => {
        try {
            await followApi.followUser(userId);
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

    const toggleFeedReviewLike = async (activityId) => {
        try {
            const activity = feed.find((item) => item.type === 'REVIEW' && item.id === activityId);
            if (!activity) return;

            const shouldUnlike = Boolean(activity.likedByMe);
            const result = shouldUnlike
                ? await reviewApi.unlikeReview(activityId)
                : await reviewApi.likeReview(activityId);
            const nextLikeCount = result?.data?.likes ?? result?.data?.likeCount;

            setFeed((prev) => prev.map((item) => {
                if (item.type !== 'REVIEW' || item.id !== activityId) return item;
                return {
                    ...item,
                    likedByMe: !shouldUnlike,
                    likeCount: typeof nextLikeCount === 'number' ? nextLikeCount : item.likeCount,
                };
            }));
        } catch (err) {
            setError(err.message);
        }
    };

    return {
        followers,
        following,
        feed,
        feedPagination,
        loading,
        error,
        fetchFollowers,
        fetchFollowing,
        fetchFeed,
        toggleFeedReviewLike,
        followUser,
        unfollowUser,
        checkFollowStatus
    };
};
