import * as searchService from '../services/search.service.js';

/**
 * Global search endpoint.
 *
 * Query params:
 * - q: search text
 * - type: one of 'all' | 'games' | 'users' | 'lists'
 * - page: page number for paginated sources
 * - limit: items per page
 */
export async function search(req, res, next) {
    try {
        const { q = '', type = 'all', page = 1, limit = 20 } = req.query;

        if (!q.trim()) {
            return res.json({
                success: true,
                games: { games: [], totalCount: 0 },
                users: { users: [], totalCount: 0 },
                lists: { lists: [], totalCount: 0 },
            });
        }

        const results = await searchService.search(q.trim(), type, parseInt(page), parseInt(limit));
        res.json({ success: true, ...results });
    } catch (error) {
        next(error);
    }
}

export async function getTrending(req, res, next) {
    try {
        const { limit = 20 } = req.query;
        const games = await searchService.getTrendingGames(parseInt(limit));
        res.json({ success: true, games });
    } catch (error) {
        next(error);
    }
}

export async function getPopularLists(req, res, next) {
    try {
        const { limit = 20 } = req.query;
        const lists = await searchService.getPopularLists(parseInt(limit));
        res.json({ success: true, lists });
    } catch (error) {
        next(error);
    }
}

export async function getFriendPlayed(req, res, next) {
    try {
        const { limit = 20 } = req.query;
        const games = await searchService.getFriendPlayedGames(req.user.id, parseInt(limit));
        res.json({ success: true, games });
    } catch (error) {
        next(error);
    }
}
