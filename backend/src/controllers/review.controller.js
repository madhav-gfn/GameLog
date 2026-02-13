import * as reviewService from '../services/review.service.js';

export async function getGameReviews(req, res, next) {
    try {
        const { page = 1, limit = 20, sortBy = 'createdAt' } = req.query;
        const result = await reviewService.getGameReviews(req.params.gameId, {
            page: parseInt(page),
            limit: parseInt(limit),
            sortBy,
        });
        res.json({ success: true, ...result });
    } catch (error) {
        next(error);
    }
}

export async function getUserReviews(req, res, next) {
    try {
        const { page = 1, limit = 20 } = req.query;
        const result = await reviewService.getUserReviews(req.params.userId, {
            page: parseInt(page),
            limit: parseInt(limit),
        });
        res.json({ success: true, ...result });
    } catch (error) {
        next(error);
    }
}

export async function createReview(req, res, next) {
    try {
        const review = await reviewService.createReview(req.user.id, req.params.gameId, req.body);
        res.status(201).json({ success: true, data: review });
    } catch (error) {
        next(error);
    }
}

export async function likeReview(req, res, next) {
    try {
        const review = await reviewService.likeReview(req.params.reviewId);
        res.json({ success: true, data: review });
    } catch (error) {
        next(error);
    }
}

export async function getReviewStats(req, res, next) {
    try {
        const stats = await reviewService.getReviewStats(req.params.gameId);
        res.json({ success: true, data: stats });
    } catch (error) {
        next(error);
    }
}
