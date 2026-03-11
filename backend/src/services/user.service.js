import prisma from '../config/database.js';

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
          lists: true,
          reviews: true,
        },
      },
    },
  });
}

export async function getUserStatsData(userId) {
  const [statusGroups, totalPlaytime, recentGames] = await Promise.all([
    // Games per status
    prisma.userGame.groupBy({
      by: ['status'],
      where: { userId },
      _count: { status: true },
    }),
    // Total playtime from UserGame.playtimeHours
    prisma.userGame.aggregate({
      where: { userId, playtimeHours: { not: null } },
      _sum: { playtimeHours: true },
    }),
    // Recent games (last 5)
    prisma.userGame.findMany({
      where: { userId },
      include: {
        game: { select: { id: true, title: true, coverImage: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    }),
  ]);

  return {
    statusCounts: statusGroups.reduce((acc, stat) => {
      acc[stat.status] = stat._count.status;
      return acc;
    }, {}),
    totalPlaytimeHours: Math.round((totalPlaytime._sum.playtimeHours || 0) * 10) / 10,
    totalGamesLogged: statusGroups.reduce((sum, s) => sum + s._count.status, 0),
    recentGames,
  };
}

export async function updateUserProfile(userId, data) {
  const updateData = {};

  if (data.displayName !== undefined) updateData.displayName = data.displayName;
  if (data.bio !== undefined) updateData.bio = data.bio;
  if (data.avatar !== undefined) updateData.avatar = data.avatar;
  if (data.platformsPlayed !== undefined) updateData.platformsPlayed = data.platformsPlayed;
  if (data.isPublic !== undefined) updateData.isPublic = data.isPublic;

  return prisma.user.update({
    where: { id: userId },
    data: updateData,
  });
}