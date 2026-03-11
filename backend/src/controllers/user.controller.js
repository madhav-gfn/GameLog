import { getUserById, getUserStatsData, updateUserProfile } from '../services/user.service.js';
import prisma from '../config/database.js';

// Get user profile
export async function getUserProfile(req, res) {
  try {
    const { id } = req.params;

    const user = await getUserById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Respect privacy: if profile is private and requester is not the owner
    const requesterId = req.user?.id || null;
    if (!user.isPublic && requesterId !== id) {
      return res.json({
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
        isPublic: false,
        message: 'This profile is private',
      });
    }

    const stats = await getUserStatsData(id);

    // Remove sensitive fields
    const { passwordHash, ...safeUser } = user;

    res.json({ ...safeUser, stats });
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

// Update own profile
export async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const { displayName, bio, avatar, platformsPlayed, isPublic } = req.body;

    const updatedUser = await updateUserProfile(userId, {
      displayName,
      bio,
      avatar,
      platformsPlayed,
      isPublic,
    });

    // Remove sensitive fields
    const { passwordHash, ...safeUser } = updatedUser;

    res.json({ success: true, data: safeUser });
  } catch (error) {
    console.error('Error in updateProfile controller:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
}

// Get user stats
export async function getUserStats(req, res) {
  try {
    const { id } = req.params;
    const stats = await getUserStatsData(id);
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error in getUserStats controller:', error);
    res.status(500).json({ error: 'Failed to fetch user stats' });
  }
}