import prisma from '../config/database.js';

/**
 * Create a new game list.
 */
export async function createList(userId, { title, description, type, isPublic }) {
    const list = await prisma.gameList.create({
        data: {
            userId,
            title,
            description: description || null,
            type: type || 'CUSTOM',
            isPublic: isPublic !== undefined ? isPublic : true,
        },
    });

    // Log activity
    await prisma.activity.create({
        data: {
            userId,
            type: 'LIST_CREATED',
            entityId: list.id,
            metadata: { title },
        },
    });

    return list;
}

/**
 * Get a user's lists (respects isPublic for non-owners).
 */
export async function getUserLists(userId, requesterId, page = 1, limit = 20) {
    const where = { userId };

    // Only show public lists if the requester is not the owner
    if (requesterId !== userId) {
        where.isPublic = true;
    }

    const [lists, total] = await Promise.all([
        prisma.gameList.findMany({
            where,
            include: {
                _count: { select: { items: true } },
            },
            orderBy: { updatedAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.gameList.count({ where }),
    ]);

    return {
        lists,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
}

/**
 * Get a single list with its items.
 */
export async function getListById(id, requesterId) {
    const list = await prisma.gameList.findUnique({
        where: { id },
        include: {
            user: { select: { id: true, username: true, avatar: true } },
            items: {
                include: {
                    game: {
                        select: { id: true, title: true, coverImage: true, genres: true, avgRating: true },
                    },
                },
                orderBy: { position: 'asc' },
            },
        },
    });

    if (!list) {
        const error = new Error('List not found');
        error.statusCode = 404;
        throw error;
    }

    // Check visibility
    if (!list.isPublic && list.userId !== requesterId) {
        const error = new Error('This list is private');
        error.statusCode = 403;
        throw error;
    }

    return list;
}

/**
 * Update a list (ownership-verified).
 */
export async function updateList(id, userId, data) {
    const list = await prisma.gameList.findUnique({ where: { id } });

    if (!list) {
        const error = new Error('List not found');
        error.statusCode = 404;
        throw error;
    }
    if (list.userId !== userId) {
        const error = new Error('Not authorized to update this list');
        error.statusCode = 403;
        throw error;
    }

    return prisma.gameList.update({
        where: { id },
        data: {
            title: data.title ?? list.title,
            description: data.description !== undefined ? data.description : list.description,
            type: data.type ?? list.type,
            isPublic: data.isPublic !== undefined ? data.isPublic : list.isPublic,
        },
    });
}

/**
 * Delete a list (ownership-verified, cascades items).
 */
export async function deleteList(id, userId) {
    const list = await prisma.gameList.findUnique({ where: { id } });

    if (!list) {
        const error = new Error('List not found');
        error.statusCode = 404;
        throw error;
    }
    if (list.userId !== userId) {
        const error = new Error('Not authorized to delete this list');
        error.statusCode = 403;
        throw error;
    }

    await prisma.gameList.delete({ where: { id } });
}

/**
 * Add a game to a list.
 */
export async function addItemToList(listId, userId, gameId, note) {
    const list = await prisma.gameList.findUnique({ where: { id: listId } });

    if (!list) {
        const error = new Error('List not found');
        error.statusCode = 404;
        throw error;
    }
    if (list.userId !== userId) {
        const error = new Error('Not authorized to modify this list');
        error.statusCode = 403;
        throw error;
    }

    // Get next position
    const maxPos = await prisma.gameListItem.aggregate({
        where: { listId },
        _max: { position: true },
    });
    const nextPosition = (maxPos._max.position ?? -1) + 1;

    const item = await prisma.gameListItem.create({
        data: {
            listId,
            gameId,
            position: nextPosition,
            note: note || null,
        },
        include: {
            game: { select: { id: true, title: true, coverImage: true } },
        },
    });

    // Log activity
    await prisma.activity.create({
        data: {
            userId,
            gameId,
            type: 'GAME_ADDED',
            entityId: item.id,
            metadata: { listTitle: list.title },
        },
    });

    return item;
}

/**
 * Remove a game from a list and reorder remaining items.
 */
export async function removeItemFromList(listId, userId, gameId) {
    const list = await prisma.gameList.findUnique({ where: { id: listId } });

    if (!list) {
        const error = new Error('List not found');
        error.statusCode = 404;
        throw error;
    }
    if (list.userId !== userId) {
        const error = new Error('Not authorized to modify this list');
        error.statusCode = 403;
        throw error;
    }

    const item = await prisma.gameListItem.findUnique({
        where: { listId_gameId: { listId, gameId } },
    });

    if (!item) {
        const error = new Error('Game not found in this list');
        error.statusCode = 404;
        throw error;
    }

    await prisma.$transaction(async (tx) => {
        await tx.gameListItem.delete({ where: { id: item.id } });

        // Reorder items after the deleted one
        await tx.gameListItem.updateMany({
            where: { listId, position: { gt: item.position } },
            data: { position: { decrement: 1 } },
        });
    });
}

/**
 * Reorder items in a list. Expects an array of { gameId, position }.
 */
export async function reorderItems(listId, userId, items) {
    const list = await prisma.gameList.findUnique({ where: { id: listId } });

    if (!list) {
        const error = new Error('List not found');
        error.statusCode = 404;
        throw error;
    }
    if (list.userId !== userId) {
        const error = new Error('Not authorized to modify this list');
        error.statusCode = 403;
        throw error;
    }

    await prisma.$transaction(
        items.map(({ gameId, position }) =>
            prisma.gameListItem.update({
                where: { listId_gameId: { listId, gameId } },
                data: { position },
            })
        )
    );
}
