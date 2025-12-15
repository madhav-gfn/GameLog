import { getUserById, getUserStats } from '../services/userService.js';
import prisma from '../config/database.js';

// Get user profile
export async function getUserProfile(req, res) {
  try {
    const { id } = req.params;
    
    const user = await getUserById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const stats = await getUserStats(id);
    
    res.json({ ...user, stats });
  } catch (error) {
    console.error('Error in getUserProfile controller:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
}

// Get user library
export async function getUserLibrary(req, res) {
  try {
    const { id } = req.params;
    const { status, page = 1, limit = 20 } = req.query;
    
    const where = { userId: id };
    if (status) where.status = status;

    const userGames = await prisma.userGame.findMany({
      where,
      include: {
        game: true,
      },
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * limit,
      take: parseInt(limit),
    });

    const total = await prisma.userGame.count({ where });

    res.json({
      games: userGames,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error in getUserLibrary controller:', error);
    res.status(500).json({ error: 'Failed to fetch user library' });
  }
}

// Get user activity feed
export async function getUserActivity(req, res) {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const activities = await prisma.activity.findMany({
      where: { userId: id },
      include: {
        user: { select: { username: true, avatar: true } },
        game: { select: { title: true, coverImage: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: parseInt(limit),
    });

    res.json({ activities });
  } catch (error) {
    console.error('Error in getUserActivity controller:', error);
    res.status(500).json({ error: 'Failed to fetch user activity' });
  }
}