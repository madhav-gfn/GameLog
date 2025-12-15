import prisma from '../config/database.js';

// Get comments for a game
export async function getGameComments(req, res) {
  try {
    const { gameId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const comments = await prisma.comment.findMany({
      where: { gameId },
      include: {
        user: { select: { username: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: parseInt(limit),
    });

    const total = await prisma.comment.count({ where: { gameId } });

    res.json({
      comments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error in getGameComments controller:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
}

// Add comment to game
export async function addComment(req, res) {
  try {
    const { gameId } = req.params;
    const { content, isReview = false } = req.body;
    const userId = req.user.id; // Assuming auth middleware

    const comment = await prisma.comment.create({
      data: {
        userId,
        gameId,
        content,
        isReview,
      },
      include: {
        user: { select: { username: true, avatar: true } },
      },
    });

    // Create activity
    await prisma.activity.create({
      data: {
        userId,
        gameId,
        type: 'COMMENT',
        entityId: comment.id,
      },
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error('Error in addComment controller:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
}