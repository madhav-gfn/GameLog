import prisma from '../config/database.js';

const RAWG_API_KEY = process.env.RAWG_API_KEY;
const RAWG_BASE_URL = 'https://api.rawg.io/api';

if (!RAWG_API_KEY) {
  console.warn('RAWG_API_KEY not found in environment variables');
}

// Map RAWG platforms to our format
const platformMap = {
  4: 'PC',
  18: 'PlayStation',
  16: 'Nintendo',
  14: 'Xbox',
  5: 'Apple Macintosh',
  7: 'Nintendo 64',
  8: 'Wii',
  9: 'iOS',
  10: 'Android',
};

// Transform RAWG game data to our format
const transformGame = (rawgGame) => ({
  id: rawgGame.id,
  rawgId: rawgGame.id,
  title: rawgGame.name,
  description: rawgGame.description || '',
  coverImage: rawgGame.background_image || '',
  releaseDate: rawgGame.released,
  platforms: rawgGame.platforms
    ? rawgGame.platforms.map((p) => platformMap[p.platform.id] || p.platform.name)
    : [],
  genres: rawgGame.genres ? rawgGame.genres.map((g) => g.name) : [],
  releaseYear: rawgGame.released ? new Date(rawgGame.released).getFullYear() : null,
  averageRating: rawgGame.rating || 0,
  ratingCount: rawgGame.ratings_count || 0,
});

// Fetch games from RAWG API
export async function fetchGamesFromRawg(options = {}) {
  if (!RAWG_API_KEY) {
    throw new Error('RAWG API key not configured');
  }

  const {
    search = '',
    genre = '',
    platform = '',
    sortBy = 'rating',
    page = 1,
    pageSize = 20,
  } = options;

  try {
    const params = new URLSearchParams({
      key: RAWG_API_KEY,
      page,
      page_size: pageSize,
    });

    // Add search query
    if (search) {
      params.append('search', search);
    }

    // Add genre filter
    if (genre) {
      params.append('genres', genre.toLowerCase());
    }

    // Add platform filter
    if (platform) {
      params.append('platforms', platform.toLowerCase());
    }

    // Add sorting
    let ordering = '';
    switch (sortBy) {
      case 'rating':
        ordering = '-rating';
        break;
      case 'year':
        ordering = '-released';
        break;
      case 'name':
        ordering = 'name';
        break;
      case 'popularity':
        ordering = '-popularity';
        break;
      default:
        ordering = '-rating';
    }
    params.append('ordering', ordering);

    const response = await fetch(`${RAWG_BASE_URL}/games?${params}`);

    if (!response.ok) {
      throw new Error(`RAWG API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      games: data.results.map(transformGame),
      totalCount: data.count,
      nextPage: data.next ? page + 1 : null,
      prevPage: data.previous ? page - 1 : null,
    };
  } catch (error) {
    console.error('Error fetching from RAWG API:', error);
    throw error;
  }
}

// Get all available genres
export async function fetchGenres() {
  try {
    const params = new URLSearchParams({
      key: RAWG_API_KEY,
      page_size: 50,
    });

    const response = await fetch(`${RAWG_BASE_URL}/genres?${params}`);

    if (!response.ok) {
      throw new Error(`RAWG API error: ${response.status}`);
    }

    const data = await response.json();
    return data.results.map((g) => ({ id: g.id, name: g.name }));
  } catch (error) {
    console.error('Error fetching genres from RAWG API:', error);
    throw error;
  }
}

// Get all available platforms
export async function fetchPlatforms() {
  try {
    const params = new URLSearchParams({
      key: RAWG_API_KEY,
      page_size: 50,
    });

    const response = await fetch(`${RAWG_BASE_URL}/platforms?${params}`);

    if (!response.ok) {
      throw new Error(`RAWG API error: ${response.status}`);
    }

    const data = await response.json();
    return data.results.map((p) => ({ id: p.id, name: p.name }));
  } catch (error) {
    console.error('Error fetching platforms from RAWG API:', error);
    throw error;
  }
}

// Get or create game in database
export async function getOrCreateGame(rawgId) {
  let game = await prisma.game.findUnique({
    where: { rawgId: parseInt(rawgId) },
  });

  if (!game) {
    // Fetch from RAWG API
    const response = await fetch(`${RAWG_BASE_URL}/games/${rawgId}?key=${RAWG_API_KEY}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch game from RAWG: ${response.status}`);
    }
    
    const rawgGame = await response.json();
    
    game = await prisma.game.create({
      data: {
        rawgId: rawgGame.id,
        title: rawgGame.name,
        description: rawgGame.description_raw || rawgGame.description || '',
        coverImage: rawgGame.background_image,
        backgroundImage: rawgGame.background_image_additional,
        releaseDate: rawgGame.released ? new Date(rawgGame.released) : null,
        genres: rawgGame.genres ? rawgGame.genres.map(g => g.name) : [],
        platforms: rawgGame.platforms ? rawgGame.platforms.map(p => p.platform.name) : [],
        developer: rawgGame.developers?.[0]?.name,
        publisher: rawgGame.publishers?.[0]?.name,
        metacriticScore: rawgGame.metacritic,
      },
    });
  }

  return game;
}
