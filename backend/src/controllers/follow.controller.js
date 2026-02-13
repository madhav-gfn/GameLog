import * as followService from '../services/follow.service.js';

export async function follow(req, res, next) {
    try {
        const result = await followService.followUser(req.user.id, req.params.userId);
        res.status(201).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
}

export async function unfollow(req, res, next) {
    try {
        await followService.unfollowUser(req.user.id, req.params.userId);
        res.json({ success: true, message: 'Unfollowed successfully' });
    } catch (error) {
        next(error);
    }
}

export async function getFollowers(req, res, next) {
    try {
        const { page = 1, limit = 20 } = req.query;
        const result = await followService.getFollowers(req.params.userId, parseInt(page), parseInt(limit));
        res.json({ success: true, ...result });
    } catch (error) {
        next(error);
    }
}

export async function getFollowing(req, res, next) {
    try {
        const { page = 1, limit = 20 } = req.query;
        const result = await followService.getFollowing(req.params.userId, parseInt(page), parseInt(limit));
        res.json({ success: true, ...result });
    } catch (error) {
        next(error);
    }
}

export async function checkFollowStatus(req, res, next) {
    try {
        const isFollowing = await followService.isFollowing(req.user.id, req.params.userId);
        res.json({ success: true, isFollowing });
    } catch (error) {
        next(error);
    }
}

export async function getSocialFeed(req, res, next) {
    try {
        const { page = 1, limit = 20 } = req.query;
        const result = await followService.getSocialFeed(req.user.id, parseInt(page), parseInt(limit));
        res.json({ success: true, ...result });
    } catch (error) {
        next(error);
    }
}
