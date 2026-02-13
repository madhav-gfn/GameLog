import prisma from '../config/database.js';

/**
 * Get paginated reviews for a game, sortable by likes or date.
 */
export async function getGameReviews(gameId, { page = 1, limit = 20, sortBy = 'createdAt' }) {
    const orderBy = sortBy === 'likes' ? { likes: 'desc' } : { createdAt: 'desc' };

    const where = { gameId, isReview: true };

    const [reviews, total] = await Promise.all([
        prisma.comment.findMany({
            where,
            include: {
                user: { select: { id: true, username: true, displayName: true, avatar: true } },
            },
            orderBy,
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.comment.count({ where }),
    ]);

    return {
        reviews,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
}

/**
 * Get all reviews by a user.
 */
export async function getUserReviews(userId, { page = 1, limit = 20 }) {
    const where = { userId, isReview: true };

    const [reviews, total] = await Promise.all([
        prisma.comment.findMany({
            where,
            include: {
                game: { select: { id: true, title: true, coverImage: true } },
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.comment.count({ where }),
    ]);

    return {
        reviews,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
}

/**
 * Create or update a review for a game.
 * Also syncs the rating to the UserGame record.
 */
export async function createReview(userId, gameId, { content, rating }) {
    // Verify game exists in our database
    const game = await prisma.game.findUnique({ where: { id: gameId } });
    if (!game) {
        const error = new Error('Game not found');
        error.statusCode = 404;
        throw error;
    }
    const actualGameId = game.id;

    return prisma.$transaction(async (tx) => {
        // Upsert review — one review per user per game
        let review = await tx.comment.findFirst({
            where: { userId, gameId: actualGameId, isReview: true },
        });

        if (review) {
            review = await tx.comment.update({
                where: { id: review.id },
                data: { content, updatedAt: new Date() },
                include: {
                    user: { select: { id: true, username: true, avatar: true } },
                },
            });
        } else {
            review = await tx.comment.create({
                data: {
                    userId,
                    gameId: actualGameId,
                    content,
                    isReview: true,
                },
                include: {
                    user: { select: { id: true, username: true, avatar: true } },
                },
            });

            // Log activity
            await tx.activity.create({
                data: {
                    userId,
                    gameId: actualGameId,
                    type: 'REVIEW',
                    entityId: review.id,
                },
            });
        }

        // Sync rating to UserGame if rating is provided
        if (rating !== undefined && rating !== null) {
            await tx.userGame.upsert({
                where: { userId_gameId: { userId, gameId: actualGameId } },
                update: { rating },
                create: {
                    userId,
                    gameId: actualGameId,
                    status: 'PLAYING',
                    rating,
                },
            });

            // Recalculate game average rating
            const ratingAgg = await tx.userGame.aggregate({
                where: { gameId: actualGameId, rating: { not: null } },
                _avg: { rating: true },
                _count: { rating: true },
            });

            await tx.game.update({
                where: { id: actualGameId },
                data: {
                    avgRating: ratingAgg._avg.rating || 0,
                    ratingCount: ratingAgg._count.rating || 0,
                },
            });
        }

        return review;
    });
}

/**
 * Increment the like count on a review.
 */
export async function likeReview(reviewId) {
    const review = await prisma.comment.findUnique({ where: { id: reviewId } });

    if (!review || !review.isReview) {
        const error = new Error('Review not found');
        error.statusCode = 404;
        throw error;
    }

    return prisma.comment.update({
        where: { id: reviewId },
        data: { likes: { increment: 1 } },
    });
}

/**
 * Get review stats for a game — average rating, count, distribution.
 */
export async function getReviewStats(gameId) {
    const [ratingAgg, distribution, reviewCount] = await Promise.all([
        prisma.userGame.aggregate({
            where: { gameId, rating: { not: null } },
            _avg: { rating: true },
            _count: { rating: true },
        }),
        prisma.userGame.groupBy({
            by: ['rating'],
            where: { gameId, rating: { not: null } },
            _count: { rating: true },
            orderBy: { rating: 'asc' },
        }),
        prisma.comment.count({ where: { gameId, isReview: true } }),
    ]);

    return {
        averageRating: ratingAgg._avg.rating ? Math.round(ratingAgg._avg.rating * 10) / 10 : null,
        totalRatings: ratingAgg._count.rating,
        totalReviews: reviewCount,
        distribution: distribution.map((d) => ({ rating: d.rating, count: d._count.rating })),
    };
}
