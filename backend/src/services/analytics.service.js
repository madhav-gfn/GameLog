import prisma from '../config/database.js';

/**
 * Get game statistics — games per status, completion rate, average rating.
 */
export async function getGameStats(userId) {
    const [statusGroups, ratingAgg, totalGames] = await Promise.all([
        prisma.userGame.groupBy({
            by: ['status'],
            where: { userId },
            _count: { status: true },
        }),
        prisma.userGame.aggregate({
            where: { userId, rating: { not: null } },
            _avg: { rating: true },
            _count: { rating: true },
        }),
        prisma.userGame.count({ where: { userId } }),
    ]);

    const statusCounts = statusGroups.reduce((acc, g) => {
        acc[g.status] = g._count.status;
        return acc;
    }, {});

    const completedCount = statusCounts.COMPLETED || 0;
    const completionRate = totalGames > 0 ? Math.round((completedCount / totalGames) * 100) : 0;

    return {
        totalGames,
        statusCounts,
        completionRate,
        averageRating: ratingAgg._avg.rating ? Math.round(ratingAgg._avg.rating * 10) / 10 : null,
        ratedGamesCount: ratingAgg._count.rating,
    };
}

/**
 * Get genre breakdown — game count per genre.
 */
export async function getGenreBreakdown(userId) {
    const userGames = await prisma.userGame.findMany({
        where: { userId },
        select: {
            game: { select: { genres: true } },
        },
    });

    const genreMap = {};
    userGames.forEach((ug) => {
        const genres = ug.game.genres || [];
        genres.forEach((genre) => {
            if (!genreMap[genre]) {
                genreMap[genre] = { genre, gameCount: 0 };
            }
            genreMap[genre].gameCount += 1;
        });
    });

    return Object.values(genreMap)
        .sort((a, b) => b.gameCount - a.gameCount);
}

/**
 * Get a combined analytics overview.
 */
export async function getAnalyticsOverview(userId) {
    const [games, genres] = await Promise.all([
        getGameStats(userId),
        getGenreBreakdown(userId),
    ]);

    return { games, genres };
}
