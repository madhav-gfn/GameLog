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
        return follow;
    } catch (err) {
        // Unique constraint — already following
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
 * Get social feed — activities from users the caller follows, paginated.
 */
export async function getSocialFeed(userId, page = 1, limit = 20) {
    // Get IDs of followed users
    const follows = await prisma.follow.findMany({
        where: { followerId: userId },
        select: { followingId: true },
    });

    const followingIds = follows.map((f) => f.followingId);

    if (followingIds.length === 0) {
        return {
            activities: [],
            pagination: { page, limit, total: 0, pages: 0 },
        };
    }

    const where = { userId: { in: followingIds } };

    const [activities, total] = await Promise.all([
        prisma.activity.findMany({
            where,
            include: {
                user: { select: { id: true, username: true, displayName: true, avatar: true } },
                game: { select: { id: true, title: true, coverImage: true } },
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.activity.count({ where }),
    ]);

    // Enrich REVIEW activities with actual review content and rating
    const enriched = await Promise.all(
        activities.map(async (activity) => {
            if (activity.type === 'REVIEW' && activity.entityId) {
                const [comment, userGame] = await Promise.all([
                    prisma.comment.findUnique({
                        where: { id: activity.entityId },
                        select: { content: true },
                    }),
                    activity.gameId ? prisma.userGame.findFirst({
                        where: { userId: activity.userId, gameId: activity.gameId },
                        select: { rating: true },
                    }) : Promise.resolve(null),
                ]);
                return {
                    ...activity,
                    reviewContent: comment?.content || null,
                    reviewRating: userGame?.rating || null,
                };
            }
            return activity;
        })
    );

    return {
        activities: enriched,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
}
