import prisma from '../config/database.js';

/**
 * Get paginated reviews for a game, sortable by likes count or date.
 */
export async function getGameReviews(gameId, { page = 1, limit = 20, sortBy = 'createdAt' }) {
    let orderBy;
    if (sortBy === 'likes') {
        orderBy = { likes: { _count: 'desc' } };
    } else {
        orderBy = { createdAt: 'desc' };
    }

    const where = { gameId };

    const [reviews, total] = await Promise.all([
        prisma.review.findMany({
            where,
            include: {
                user: { select: { id: true, username: true, displayName: true, avatar: true } },
                _count: { select: { likes: true } },
            },
            orderBy,
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.review.count({ where }),
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
    const where = { userId };

    const [reviews, total] = await Promise.all([
        prisma.review.findMany({
            where,
            include: {
                game: { select: { id: true, title: true, coverImage: true } },
                _count: { select: { likes: true } },
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.review.count({ where }),
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
        // Upsert review - one review per user per game
        let review = await tx.review.findUnique({
            where: { userId_gameId: { userId, gameId: actualGameId } },
        });

        if (review) {
            review = await tx.review.update({
                where: { id: review.id },
                data: { content, rating, updatedAt: new Date() },
                include: {
                    user: { select: { id: true, username: true, avatar: true } },
                    _count: { select: { likes: true } },
                },
            });
        } else {
            review = await tx.review.create({
                data: {
                    userId,
                    gameId: actualGameId,
                    content,
                    rating,
                },
                include: {
                    user: { select: { id: true, username: true, avatar: true } },
                    _count: { select: { likes: true } },
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
 * Like a review. Uses the Like model for proper per-user tracking.
 * Creates a notification for the review author.
 */
export async function likeReview(userId, reviewId) {
    const review = await prisma.review.findUnique({ where: { id: reviewId } });

    if (!review) {
        const error = new Error('Review not found');
        error.statusCode = 404;
        throw error;
    }

    // Check if already liked
    const existingLike = await prisma.like.findUnique({
        where: { userId_reviewId: { userId, reviewId } },
    });

    if (existingLike) {
        const error = new Error('Already liked this review');
        error.statusCode = 409;
        throw error;
    }

    const like = await prisma.like.create({
        data: { userId, reviewId },
    });

    // Create notification for the review author (if not liking own review)
    if (review.userId !== userId) {
        await prisma.notification.create({
            data: {
                userId: review.userId,
                type: 'LIKE',
                fromUserId: userId,
                entityId: reviewId,
            },
        });
    }

    // Return updated like count
    const likeCount = await prisma.like.count({ where: { reviewId } });

    return { liked: true, likeCount };
}

/**
 * Unlike a review.
 */
export async function unlikeReview(userId, reviewId) {
    try {
        await prisma.like.delete({
            where: { userId_reviewId: { userId, reviewId } },
        });
    } catch (err) {
        if (err.code === 'P2025') {
            const error = new Error('You have not liked this review');
            error.statusCode = 404;
            throw error;
        }
        throw err;
    }
}

/**
 * Get review stats for a game - average rating, count, distribution.
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
        prisma.review.count({ where: { gameId } }),
    ]);

    return {
        averageRating: ratingAgg._avg.rating ? Math.round(ratingAgg._avg.rating * 10) / 10 : null,
        totalRatings: ratingAgg._count.rating,
        totalReviews: reviewCount,
        distribution: distribution.map((d) => ({ rating: d.rating, count: d._count.rating })),
    };
}
