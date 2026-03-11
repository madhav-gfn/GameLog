import prisma from '../config/database.js';

/**
 * Get user's notifications, paginated.
 */
export async function getNotifications(userId, page = 1, limit = 20) {
    const where = { userId };

    const [notifications, total, unreadCount] = await Promise.all([
        prisma.notification.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.notification.count({ where }),
        prisma.notification.count({ where: { userId, read: false } }),
    ]);

    // Enrich with fromUser data
    const enriched = await Promise.all(
        notifications.map(async (notif) => {
            let fromUser = null;
            if (notif.fromUserId) {
                fromUser = await prisma.user.findUnique({
                    where: { id: notif.fromUserId },
                    select: { id: true, username: true, displayName: true, avatar: true },
                });
            }
            return { ...notif, fromUser };
        })
    );

    return {
        notifications: enriched,
        unreadCount,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
}

/**
 * Mark a single notification as read.
 */
export async function markAsRead(notificationId, userId) {
    const notif = await prisma.notification.findUnique({ where: { id: notificationId } });

    if (!notif) {
        const error = new Error('Notification not found');
        error.statusCode = 404;
        throw error;
    }
    if (notif.userId !== userId) {
        const error = new Error('Not authorized');
        error.statusCode = 403;
        throw error;
    }

    return prisma.notification.update({
        where: { id: notificationId },
        data: { read: true },
    });
}

/**
 * Mark all notifications as read for a user.
 */
export async function markAllAsRead(userId) {
    return prisma.notification.updateMany({
        where: { userId, read: false },
        data: { read: true },
    });
}
