import prisma from '../config/database.js';
import bcrypt from 'bcrypt';

export async function createUser(userData) {
  const { username, email, password, displayName, bio } = userData;
  
  const hashedPassword = await bcrypt.hash(password, 10);
  
  return await prisma.user.create({
    data: {
      username,
      email,
      passwordHash: hashedPassword,
      displayName,
      bio,
    },
  });
}

export async function getUserById(id) {
  return await prisma.user.findUnique({
    where: { id },
    include: {
      games: {
        include: { game: true },
        orderBy: { updatedAt: 'desc' },
      },
      _count: {
        select: {
          followers: true,
          following: true,
          games: true,
        },
      },
    },
  });
}

export async function getUserStats(userId) {
  const stats = await prisma.userGame.groupBy({
    by: ['status'],
    where: { userId },
    _count: { status: true },
  });

  const totalHours = await prisma.playSession.aggregate({
    where: { userId },
    _sum: { durationMinutes: true },
  });

  return {
    statusCounts: stats.reduce((acc, stat) => {
      acc[stat.status] = stat._count.status;
      return acc;
    }, {}),
    totalHours: Math.round((totalHours._sum.durationMinutes || 0) / 60),
  };
}