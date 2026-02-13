import { fetchGamesFromRawg, fetchGenres, fetchPlatforms, getOrCreateGame, getIGDBEnrichment } from '../services/games.service.js';
import prisma from '../config/database.js';

// Get games with filters (RAWG-powered)
export async function getGames(req, res) {
  try {
    const { search = '', genre = '', platform = '', sortBy = 'rating', page = 1 } = req.query;

    const games = await fetchGamesFromRawg({
      search,
      genre,
      platform,
      sortBy,
      page: parseInt(page),
      pageSize: 20,
    });

    res.json(games);
  } catch (error) {
    console.error('Error in getGames controller:', error);
    res.status(500).json({ error: 'Failed to fetch games' });
  }
}

// Get game details with IGDB enrichment (fetched live)
export async function getGameDetails(req, res) {
  try {
    const { id } = req.params;

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    let game;

    if (isUUID) {
      game = await prisma.game.findUnique({
        where: { id },
        include: {
          comments: {
            include: { user: { select: { username: true, avatar: true } } },
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
          _count: {
            select: { users: true, comments: true },
          },
        },
      });
    } else {
      const rawgId = parseInt(id);
      if (isNaN(rawgId)) {
        return res.status(400).json({ error: 'Invalid game ID format' });
      }

      game = await prisma.game.findUnique({
        where: { rawgId },
        include: {
          comments: {
            include: { user: { select: { username: true, avatar: true } } },
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
          _count: {
            select: { users: true, comments: true },
          },
        },
      });

      if (!game) {
        try {
          game = await getOrCreateGame(rawgId);
          game = await prisma.game.findUnique({
            where: { id: game.id },
            include: {
              comments: {
                include: { user: { select: { username: true, avatar: true } } },
                orderBy: { createdAt: 'desc' },
                take: 10,
              },
              _count: {
                select: { users: true, comments: true },
              },
            },
          });
        } catch (rawgError) {
          console.error('Error fetching from RAWG:', rawgError);
          return res.status(404).json({ error: 'Game not found' });
        }
      }
    }

    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Fetch IGDB enrichment live (not stored in DB)
    const igdbData = await getIGDBEnrichment(game);

    // Build response
    const gameData = {
      ...game,
      id: game.id,
      cover: game.coverImage,
      coverImage: game.coverImage,
      releaseYear: game.releaseDate ? new Date(game.releaseDate).getFullYear() : null,
      averageRating: game.avgRating,
      ratingCount: game.ratingCount,
      // IGDB enrichment (live-fetched, empty arrays if IGDB unavailable)
      screenshots: igdbData?.screenshots || [],
      artworks: igdbData?.artworks || [],
      storyline: igdbData?.storyline || null,
      videos: igdbData?.videos || [],
      similarGames: igdbData?.similarGames || [],
      themes: igdbData?.themes || [],
      gameModes: igdbData?.gameModes || [],
      companies: igdbData?.companies || [],
      ageRatings: igdbData?.ageRatings || [],
      igdbCover: igdbData?.cover || null,
    };

    res.json(gameData);
  } catch (error) {
    console.error('Error in getGameDetails controller:', error);
    res.status(500).json({ error: 'Failed to fetch game details' });
  }
}

// Add game to user library
export async function addGameToLibrary(req, res) {
  try {
    const { gameId } = req.params;
    const { status, rating, review } = req.body;
    const userId = req.user.id;

    const game = await getOrCreateGame(gameId);

    const userGame = await prisma.userGame.upsert({
      where: {
        userId_gameId: { userId, gameId: game.id },
      },
      update: {
        status,
        rating,
        review,
        updatedAt: new Date(),
      },
      create: {
        userId,
        gameId: game.id,
        status,
        rating,
        review,
      },
    });

    // Update game stats
    await updateGameStats(game.id);

    // Log activity
    const activityType = status === 'PLAYING' ? 'STARTED' : 'GAME_ADDED';
    await prisma.activity.create({
      data: {
        userId,
        gameId: game.id,
        type: activityType,
        entityId: userGame.id,
        metadata: { status },
      },
    });

    res.json(userGame);
  } catch (error) {
    console.error('Error in addGameToLibrary controller:', error);
    res.status(500).json({
      error: 'Failed to add game to library',
      details: error.message,
      code: error.code || null
    });
  }
}

// Get available genres
export async function getGenres(req, res) {
  try {
    const genres = await fetchGenres();
    res.json({ genres });
  } catch (error) {
    console.error('Error in getGenres controller:', error);
    res.status(500).json({ error: 'Failed to fetch genres' });
  }
}

// Get available platforms
export async function getPlatforms(req, res) {
  try {
    const platforms = await fetchPlatforms();
    res.json({ platforms });
  } catch (error) {
    console.error('Error in getPlatforms controller:', error);
    res.status(500).json({ error: 'Failed to fetch platforms' });
  }
}

// Helper function to update game statistics
async function updateGameStats(gameId) {
  const avgRating = await prisma.userGame.aggregate({
    where: { gameId, rating: { not: null } },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await prisma.game.update({
    where: { id: gameId },
    data: {
      avgRating: avgRating._avg.rating || 0,
      ratingCount: avgRating._count.rating || 0,
    },
  });
}
