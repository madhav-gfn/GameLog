import prisma from '../config/database.js';

/**
 * Follow a user.
 */
export async function followUser(followerId, followingId) {
    if (followerId === followingId) {
        const error = new Error('Cannot follow yourself');
        error.statusCode = 400;
        throw error;
    }

    // Verify target user exists
    const targetUser = await prisma.user.findUnique({ where: { id: followingId } });
    if (!targetUser) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }

    try {
        const follow = await prisma.follow.create({
            data: { followerId, followingId },
        });

        // Create notification for the followed user
        await prisma.notification.create({
            data: {
                userId: followingId,
                type: 'NEW_FOLLOWER',
                fromUserId: followerId,
            },
        });

        return follow;
    } catch (err) {
        // Unique constraint - already following
        if (err.code === 'P2002') {
            const error = new Error('Already following this user');
            error.statusCode = 409;
            throw error;
        }
        throw err;
    }
}

/**
 * Unfollow a user.
 */
export async function unfollowUser(followerId, followingId) {
    try {
        await prisma.follow.delete({
            where: { followerId_followingId: { followerId, followingId } },
        });
    } catch (err) {
        if (err.code === 'P2025') {
            const error = new Error('Not following this user');
            error.statusCode = 404;
            throw error;
        }
        throw err;
    }
}

/**
 * Get paginated followers for a user.
 */
export async function getFollowers(userId, page = 1, limit = 20) {
    const where = { followingId: userId };

    const [follows, total] = await Promise.all([
        prisma.follow.findMany({
            where,
            include: {
                follower: {
                    select: { id: true, username: true, displayName: true, avatar: true, bio: true },
                },
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.follow.count({ where }),
    ]);

    return {
        users: follows.map((f) => f.follower),
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
}

/**
 * Get paginated list of users a user is following.
 */
export async function getFollowing(userId, page = 1, limit = 20) {
    const where = { followerId: userId };

    const [follows, total] = await Promise.all([
        prisma.follow.findMany({
            where,
            include: {
                following: {
                    select: { id: true, username: true, displayName: true, avatar: true, bio: true },
                },
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.follow.count({ where }),
    ]);

    return {
        users: follows.map((f) => f.following),
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
}

/**
 * Check if followerId follows followingId.
 */
export async function isFollowing(followerId, followingId) {
    const follow = await prisma.follow.findUnique({
        where: { followerId_followingId: { followerId, followingId } },
    });
    return !!follow;
}

/**
 * Get social feed - recent activity from users the caller follows.
 * Queries UserGame logs and Reviews instead of Activity model.
 */
export async function getSocialFeed(userId, page = 1, limit = 20) {
    // Fetch recent game logs and reviews from other users (global feed, own posts excluded)
    const [recentLogs, recentReviews] = await Promise.all([
        prisma.userGame.findMany({
            where: { userId: { not: userId } },
            include: {
                user: { select: { id: true, username: true, displayName: true, avatar: true } },
                game: { select: { id: true, title: true, coverImage: true } },
            },
            orderBy: { updatedAt: 'desc' },
            take: limit * 2, // Fetch extra to merge with reviews
        }),
        prisma.review.findMany({
            where: { userId: { not: userId } },
            include: {
                user: { select: { id: true, username: true, displayName: true, avatar: true } },
                game: { select: { id: true, title: true, coverImage: true } },
                _count: { select: { likes: true, comments: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: limit * 2,
        }),
    ]);

    const reviewIds = recentReviews.map((review) => review.id);
    const likedReviewIds = reviewIds.length > 0
        ? new Set((await prisma.like.findMany({
            where: { userId, reviewId: { in: reviewIds } },
            select: { reviewId: true },
        })).map((like) => like.reviewId))
        : new Set();

    // Transform into unified feed items
    const feedItems = [];

    for (const log of recentLogs) {
        feedItems.push({
            type: 'LOG',
            id: log.id,
            user: log.user,
            game: log.game,
            status: log.status,
            platform: log.platform,
            playtimeHours: log.playtimeHours,
            progressPercent: log.progressPercent,
            rating: log.rating,
            reviewText: log.reviewText,
            timestamp: log.updatedAt,
        });
    }

    for (const review of recentReviews) {
        feedItems.push({
            type: 'REVIEW',
            id: review.id,
            user: review.user,
            game: review.game,
            content: review.content,
            rating: review.rating,
            likeCount: review._count.likes,
            commentCount: review._count.comments,
            likedByMe: likedReviewIds.has(review.id),
            timestamp: review.createdAt,
        });
    }

    // Sort by timestamp descending and paginate
    feedItems.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const total = feedItems.length;
    const start = (page - 1) * limit;
    const paged = feedItems.slice(start, start + limit);

    return {
        activities: paged,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
}
