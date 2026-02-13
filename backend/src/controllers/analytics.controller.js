import * as analyticsService from '../services/analytics.service.js';

export async function getOverview(req, res, next) {
    try {
        const userId = req.query.userId || req.user.id;
        const overview = await analyticsService.getAnalyticsOverview(userId);
        res.json({ success: true, data: overview });
    } catch (error) {
        next(error);
    }
}

export async function getGameStats(req, res, next) {
    try {
        const userId = req.query.userId || req.user.id;
        const stats = await analyticsService.getGameStats(userId);
        res.json({ success: true, data: stats });
    } catch (error) {
        next(error);
    }
}

export async function getGenreBreakdown(req, res, next) {
    try {
        const userId = req.query.userId || req.user.id;
        const genres = await analyticsService.getGenreBreakdown(userId);
        res.json({ success: true, data: genres });
    } catch (error) {
        next(error);
    }
}
