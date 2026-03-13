export const normalizeGame = (game = {}) => ({
  id: game.id || game.rawgId || game.gameId || null,
  rawgId: game.rawgId || game.id || game.gameId || null,
  title: game.title || game.name || 'Unknown Game',
  coverImage: game.coverImage || game.cover || game.backgroundImage || '',
  platforms: Array.isArray(game.platforms) ? game.platforms : [],
  genres: Array.isArray(game.genres) ? game.genres : [],
  releaseDate: game.releaseDate || game.released || null,
});

export const normalizeLibraryEntry = (entry = {}) => {
  const game = normalizeGame(entry.game || {});
  return {
    id: entry.id || `${entry.gameId || game.rawgId}-${entry.updatedAt || Date.now()}`,
    gameId: entry.gameId || game.rawgId,
    status: entry.status || 'BACKLOG',
    rating: entry.rating ?? null,
    playtimeHours: entry.playtimeHours ?? null,
    progressPercent: entry.progressPercent ?? null,
    updatedAt: entry.updatedAt || entry.createdAt || new Date().toISOString(),
    game,
  };
};

export const normalizeFeedActivity = (activity = {}) => {
  const rawUserGame = activity.userGame || activity;
  const game = normalizeGame(activity.game || rawUserGame.game || {});

  const actor = activity.user || activity.actor || {};

  return {
    id: activity.id || `${rawUserGame.gameId || game.rawgId}-${activity.createdAt || rawUserGame.updatedAt || Date.now()}`,
    actor: actor.username || actor.displayName || activity.actorName || 'Player',
    actorId: actor.id || activity.userId || null,
    type: activity.type || 'library_update',
    timestamp: activity.createdAt || rawUserGame.updatedAt || new Date().toISOString(),
    status: rawUserGame.status || null,
    rating: rawUserGame.rating ?? null,
    likeCount: activity.likeCount || 0,
    platform: rawUserGame.platform || game.platforms?.[0] || null,
    gameId: rawUserGame.gameId || game.rawgId,
    game,
    userGame: { ...rawUserGame, gameId: rawUserGame.gameId || game.rawgId },
  };
};

export const normalizeNotification = (notification = {}) => ({
  id: notification.id,
  type: notification.type || 'notification',
  read: Boolean(notification.read),
  createdAt: notification.createdAt || new Date().toISOString(),
  fromUser: notification.fromUser || notification.actor || null,
  payload: notification.payload || { message: notification.message || '' },
});

export const normalizeNotificationResponse = (response = {}, fallbackPage = 1, fallbackLimit = 20) => {
  const notifications = (response.notifications || response.items || []).map(normalizeNotification);
  return {
    notifications,
    unreadCount: response.unreadCount ?? notifications.filter((item) => !item.read).length,
    pagination: response.pagination || {
      page: fallbackPage,
      pages: 1,
      total: notifications.length,
      limit: fallbackLimit,
    },
  };
};

export const normalizeFeedResponse = (response = {}, fallbackPage = 1, fallbackLimit = 10) => {
  const activities = (response.activities || response.items || response.feed || [])
    .map(normalizeFeedActivity)
    .filter(Boolean);

  const pagination = response.pagination || {
    page: fallbackPage,
    limit: fallbackLimit,
    total: response.total || activities.length,
    pages: response.pages || (response.hasMore ? fallbackPage + 1 : fallbackPage),
  };

  return { activities, pagination, hasMore: Boolean(response.hasMore) };
};
