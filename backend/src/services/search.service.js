import prisma from '../config/database.js';
import { fetchGamesFromRawg } from './games.service.js';

/**
 * Search games in RAWG plus users/lists in local database.
 */
export async function search(query, type = 'all', page = 1, limit = 20) {
    const results = {};

    if (type === 'all' || type === 'games') {
        try {
            const rawgResults = await fetchGamesFromRawg({
                search: query,
                page,
                pageSize: limit,
            });
            results.games = rawgResults;
        } catch (error) {
            console.error('Game search error:', error.message);
            results.games = { games: [], totalCount: 0 };
        }
    }

    if (type === 'all' || type === 'users') {
        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where: {
                    isPublic: true,
                    OR: [
                        { username: { contains: query, mode: 'insensitive' } },
                        { displayName: { contains: query, mode: 'insensitive' } },
                    ],
                },
                select: {
                    id: true,
                    username: true,
                    displayName: true,
                    avatar: true,
                    bio: true,
                    _count: { select: { games: true, followers: true } },
                },
                take: limit,
                skip: (page - 1) * limit,
            }),
            prisma.user.count({
                where: {
                    isPublic: true,
                    OR: [
                        { username: { contains: query, mode: 'insensitive' } },
                        { displayName: { contains: query, mode: 'insensitive' } },
                    ],
                },
            }),
        ]);

        results.users = {
            users,
            totalCount: total,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        };
    }

    if (type === 'all' || type === 'lists') {
        const where = {
            isPublic: true,
            OR: [
                { title: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
            ],
        };

        const [lists, total] = await Promise.all([
            prisma.gameList.findMany({
                where,
                include: {
                    user: { select: { id: true, username: true, avatar: true } },
                    _count: { select: { items: true } },
                },
                take: limit,
                skip: (page - 1) * limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.gameList.count({ where }),
        ]);

        results.lists = {
            lists,
            totalCount: total,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        };
    }

    return results;
}

/**
 * Get trending games - most logged/reviewed in the last 30 days.
 */
export async function getTrendingGames(limit = 20) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get games with most recent UserGame entries
    const trendingLogs = await prisma.userGame.groupBy({
        by: ['gameId'],
        where: {
            createdAt: { gte: thirtyDaysAgo },
        },
        _count: { gameId: true },
        orderBy: { _count: { gameId: 'desc' } },
        take: limit,
    });

    if (trendingLogs.length === 0) {
        // Fall back to top-rated games if no recent activity
        return prisma.game.findMany({
            orderBy: { avgRating: 'desc' },
            take: limit,
        });
    }

    const gameIds = trendingLogs.map((t) => t.gameId);

    const games = await prisma.game.findMany({
        where: { id: { in: gameIds } },
    });

    // Preserve trending order and attach log count
    return gameIds
        .map((id) => {
            const game = games.find((g) => g.id === id);
            const logEntry = trendingLogs.find((t) => t.gameId === id);
            return game ? { ...game, recentLogCount: logEntry._count.gameId } : null;
        })
        .filter(Boolean);
}

/**
 * Get popular public lists - lists with most items.
 */
export async function getPopularLists(limit = 20) {
    return prisma.gameList.findMany({
        where: { isPublic: true },
        include: {
            user: { select: { id: true, username: true, avatar: true } },
            _count: { select: { items: true } },
        },
        orderBy: { items: { _count: 'desc' } },
        take: limit,
    });
}

/**
 * Get "Because your friend played" recommendations.
 * Returns games that people you follow have logged but you haven't.
 */
export async function getFriendPlayedGames(userId, limit = 20) {
    // Get who I follow
    const follows = await prisma.follow.findMany({
        where: { followerId: userId },
        select: { followingId: true },
    });
    const followingIds = follows.map((f) => f.followingId);

    if (followingIds.length === 0) return [];

    // Get game IDs I've already logged
    const myGameIds = (await prisma.userGame.findMany({
        where: { userId },
        select: { gameId: true },
    })).map((ug) => ug.gameId);

    // Get games my friends logged that I haven't, ranked by how many friends logged them
    const friendGames = await prisma.userGame.groupBy({
        by: ['gameId'],
        where: {
            userId: { in: followingIds },
            gameId: { notIn: myGameIds.length > 0 ? myGameIds : ['none'] },
        },
        _count: { gameId: true },
        orderBy: { _count: { gameId: 'desc' } },
        take: limit,
    });

    if (friendGames.length === 0) return [];

    const gameIds = friendGames.map((fg) => fg.gameId);

    const games = await prisma.game.findMany({
        where: { id: { in: gameIds } },
    });

    return gameIds
        .map((id) => {
            const game = games.find((g) => g.id === id);
            const entry = friendGames.find((fg) => fg.gameId === id);
            return game ? { ...game, friendCount: entry._count.gameId } : null;
        })
        .filter(Boolean);
}
