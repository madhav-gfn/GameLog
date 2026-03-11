import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

// Load environment variables
config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });
// Fallback to .env if the specific file doesn't exist
config({ path: '.env' });

const prisma = new PrismaClient();

const RAWG_API_KEY = process.env.RAWG_API_KEY;
const RAWG_BASE_URL = 'https://api.rawg.io/api';
const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;
const TWITCH_TOKEN_URL = 'https://id.twitch.tv/oauth2/token';
const IGDB_BASE_URL = 'https://api.igdb.com/v4';

// ─── IGDB helpers for seed ────────────────────────────────────────────

let igdbToken = null;

async function getIGDBToken() {
  if (igdbToken) return igdbToken;
  if (!TWITCH_CLIENT_ID || !TWITCH_CLIENT_SECRET) return null;

  const params = new URLSearchParams({
    client_id: TWITCH_CLIENT_ID,
    client_secret: TWITCH_CLIENT_SECRET,
    grant_type: 'client_credentials',
  });

  const res = await fetch(`${TWITCH_TOKEN_URL}?${params}`, { method: 'POST' });
  if (!res.ok) return null;

  const data = await res.json();
  igdbToken = data.access_token;
  return igdbToken;
}

async function igdbRequest(endpoint, body) {
  const token = await getIGDBToken();
  if (!token) return null;

  const res = await fetch(`${IGDB_BASE_URL}/${endpoint}`, {
    method: 'POST',
    headers: {
      'Client-ID': TWITCH_CLIENT_ID,
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'text/plain',
    },
    body,
  });

  if (!res.ok) return null;
  return res.json();
}

/**
 * Search IGDB for a game, cache igdbId, and log available media.
 */
async function enrichWithIGDB(game) {
  const token = await getIGDBToken();
  if (!token) return;

  // Search by name
  const searchBody = `search "${game.title.replace(/"/g, '\\"')}";
fields id, name, cover.image_id, screenshots.image_id, artworks.image_id, videos.video_id;
limit 5;`;

  const results = await igdbRequest('games', searchBody);
  if (!results || results.length === 0) {
    console.log(`    ⚠️  IGDB: No match found for "${game.title}"`);
    return;
  }

  // Find best match
  const match = results.find((g) => g.name.toLowerCase() === game.title.toLowerCase()) || results[0];

  // Cache igdbId
  await prisma.game.update({
    where: { id: game.id },
    data: { igdbId: match.id },
  });

  const screenshots = match.screenshots?.length || 0;
  const artworks = match.artworks?.length || 0;
  const videos = match.videos?.length || 0;

  console.log(`    ✅ IGDB: Linked "${game.title}" → ID ${match.id} (${screenshots} screenshots, ${artworks} artworks, ${videos} videos)`);
}

/**
 * Fetch game details from RAWG API by ID.
 */
async function fetchGameFromRawg(rawgId) {
  if (!RAWG_API_KEY) {
    throw new Error('RAWG_API_KEY not set — cannot fetch game data');
  }

  const response = await fetch(`${RAWG_BASE_URL}/games/${rawgId}?key=${RAWG_API_KEY}`);
  if (!response.ok) {
    throw new Error(`RAWG API error for game ${rawgId}: ${response.status}`);
  }

  const game = await response.json();

  return {
    rawgId: game.id,
    title: game.name,
    slug: game.slug,
    description: game.description_raw || game.description || '',
    coverImage: game.background_image || '',
    releaseDate: game.released ? new Date(game.released) : null,
    genres: game.genres ? game.genres.map((g) => g.name) : [],
    platforms: game.platforms ? game.platforms.map((p) => p.platform.name) : [],
    developer: game.developers?.[0]?.name || null,
    publisher: game.publishers?.[0]?.name || null,
    esrbRating: game.esrb_rating?.name || null,
    storeLinks: game.stores
      ? game.stores.reduce((acc, s) => {
        acc[s.store.name] = s.url || `https://${s.store.domain}`;
        return acc;
      }, {})
      : null,
  };
}

/**
 * Create or find a game in the database, fetching from RAWG if needed.
 */
async function getOrCreateGame(rawgId) {
  let game = await prisma.game.findUnique({ where: { rawgId } });

  if (!game) {
    console.log(`  Fetching game ${rawgId} from RAWG...`);
    const rawgData = await fetchGameFromRawg(rawgId);
    game = await prisma.game.create({ data: rawgData });
    console.log(`  ✅ Fetched & created: ${game.title}`);
  } else {
    console.log(`  ⚠️  Game already exists: ${game.title}`);
  }

  // Enrich with IGDB data (link igdbId) if not already linked
  if (!game.igdbId) {
    await enrichWithIGDB(game);
  } else {
    console.log(`    ℹ️  IGDB: Already linked (ID ${game.igdbId})`);
  }

  return game;
}

// ─── Seed configuration ───────────────────────────────────────────────

// RAWG game IDs for seed data
const SEED_GAMES = [
  { rawgId: 3498, logData: { status: 'COMPLETED', platform: 'PC', playtimeHours: 45.5, progressPercent: 100, rating: 9, reviewText: 'Amazing game! One of the best open world games ever.', playedAt: new Date('2024-01-15') } },
  { rawgId: 3328, logData: { status: 'PLAYING', platform: 'PC', playtimeHours: 22.0, progressPercent: 35, playedAt: new Date('2025-01-10') } },
  { rawgId: 274755, logData: { status: 'COMPLETED', platform: 'Nintendo Switch', playtimeHours: 18.5, progressPercent: 100, rating: 10, reviewText: 'Addictive roguelike loop; great combat.', playedAt: new Date('2026-03-11') } },
  { rawgId: 3439, logData: { status: 'COMPLETED', platform: 'PlayStation 5', playtimeHours: 30.0, progressPercent: 100, rating: 8, playedAt: new Date('2025-06-20') } },
  { rawgId: 58175, logData: { status: 'BACKLOG', platform: 'PC' } },
];

async function main() {
  try {
    if (!RAWG_API_KEY) {
      console.error('❌ RAWG_API_KEY env variable is required for seeding. Set it in your .env file.');
      process.exit(1);
    }

    console.log('🎮 Starting seed with RAWG API data...');

    const igdbAvailable = !!(TWITCH_CLIENT_ID && TWITCH_CLIENT_SECRET);
    if (igdbAvailable) {
      console.log('🔗 IGDB enrichment enabled (Twitch credentials found)\n');
    } else {
      console.log('ℹ️  IGDB enrichment skipped (no TWITCH_CLIENT_ID/TWITCH_CLIENT_SECRET)\n');
    }

    // ─── Create users ─────────────────────────────────────────────
    let user1, user2;

    try {
      user1 = await prisma.user.create({
        data: {
          username: 'gamer_pro',
          email: 'gamer@example.com',
          displayName: 'Gaming Pro',
          bio: 'Hardcore gamer who loves RPGs and roguelikes',
          platformsPlayed: ['PC', 'PlayStation 5', 'Nintendo Switch'],
          isPublic: true,
        },
      });
      console.log('✅ Created user: gamer_pro');
    } catch (e) {
      if (e.code === 'P2002') {
        user1 = await prisma.user.findUnique({ where: { username: 'gamer_pro' } });
        console.log('⚠️  User gamer_pro already exists');
      } else throw e;
    }

    try {
      user2 = await prisma.user.create({
        data: {
          username: 'casual_gamer',
          email: 'casual@example.com',
          displayName: 'Casual Gamer',
          bio: 'Play for fun on weekends',
          platformsPlayed: ['PC', 'Mobile'],
          isPublic: true,
        },
      });
      console.log('✅ Created user: casual_gamer');
    } catch (e) {
      if (e.code === 'P2002') {
        user2 = await prisma.user.findUnique({ where: { username: 'casual_gamer' } });
        console.log('⚠️  User casual_gamer already exists');
      } else throw e;
    }

    // ─── Fetch games from RAWG & create logs ─────────────────────
    console.log('\n📡 Fetching games from RAWG API...');

    for (const { rawgId, logData } of SEED_GAMES) {
      try {
        const game = await getOrCreateGame(rawgId);

        // Create user-game log for user1
        const exists = await prisma.userGame.findUnique({
          where: { userId_gameId: { userId: user1.id, gameId: game.id } },
        });

        if (!exists) {
          await prisma.userGame.create({
            data: {
              userId: user1.id,
              gameId: game.id,
              ...logData,
            },
          });
          console.log(`  ✅ Logged: gamer_pro + ${game.title} [${logData.status}]`);
        } else {
          console.log(`  ⚠️  Log already exists: gamer_pro + ${game.title}`);
        }
      } catch (e) {
        console.error(`  ❌ Error with RAWG ID ${rawgId}:`, e.message);
      }
    }

    // ─── Create reviews ──────────────────────────────────────────
    console.log('\n📝 Creating reviews...');

    const reviewGames = await prisma.userGame.findMany({
      where: { userId: user1.id, reviewText: { not: null } },
      include: { game: { select: { id: true, title: true } } },
    });

    for (const ug of reviewGames) {
      try {
        await prisma.review.create({
          data: {
            userId: user1.id,
            gameId: ug.gameId,
            content: ug.reviewText,
            rating: ug.rating,
          },
        });
        console.log(`  ✅ Review created for: ${ug.game.title}`);
      } catch (e) {
        if (e.code === 'P2002') {
          console.log(`  ⚠️  Review already exists for: ${ug.game.title}`);
        } else {
          console.error(`  ❌ Error creating review for ${ug.game.title}:`, e.message);
        }
      }
    }

    // ─── Create follow + list ────────────────────────────────────
    console.log('\n👥 Creating social data...');

    try {
      const exists = await prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: user1.id, followingId: user2.id } },
      });
      if (!exists) {
        await prisma.follow.create({
          data: { followerId: user1.id, followingId: user2.id },
        });
        console.log('  ✅ Follow: gamer_pro -> casual_gamer');
      } else {
        console.log('  ⚠️  Follow relationship already exists');
      }
    } catch (e) {
      console.error('  ❌ Error creating follow:', e.message);
    }

    // Create a curated list with games from the library
    try {
      const hadesGame = await prisma.game.findUnique({ where: { rawgId: 274755 } });
      if (hadesGame) {
        const list = await prisma.gameList.create({
          data: {
            userId: user1.id,
            title: 'Best Roguelikes',
            description: 'My favorite roguelike games of all time',
            isPublic: true,
          },
        });

        await prisma.gameListItem.create({
          data: { listId: list.id, gameId: hadesGame.id, position: 0 },
        });

        console.log('  ✅ List created: Best Roguelikes');
      }
    } catch (e) {
      console.error('  ❌ Error creating list:', e.message);
    }

    console.log('\n✅ Seed completed successfully!');
  } catch (error) {
    console.error('\n❌ Fatal error during seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
