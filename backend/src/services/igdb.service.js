import { TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET } from '../config/env.js';

const TWITCH_TOKEN_URL = 'https://id.twitch.tv/oauth2/token';
const IGDB_BASE_URL = 'https://api.igdb.com/v4';
const IGDB_IMAGE_BASE = 'https://images.igdb.com/igdb/image/upload';

// Token cache
let cachedToken = null;
let tokenExpiresAt = 0;

/**
 * Get a valid IGDB access token, refreshing if expired.
 */
async function getAccessToken() {
    if (!TWITCH_CLIENT_ID || !TWITCH_CLIENT_SECRET) {
        throw new Error('IGDB: Missing TWITCH_CLIENT_ID or TWITCH_CLIENT_SECRET');
    }

    // Return cached token if still valid (with 60s buffer)
    if (cachedToken && Date.now() < tokenExpiresAt - 60_000) {
        return cachedToken;
    }

    const params = new URLSearchParams({
        client_id: TWITCH_CLIENT_ID,
        client_secret: TWITCH_CLIENT_SECRET,
        grant_type: 'client_credentials',
    });

    const response = await fetch(`${TWITCH_TOKEN_URL}?${params}`, {
        method: 'POST',
    });

    if (!response.ok) {
        throw new Error(`Twitch token error: ${response.status} ${await response.text()}`);
    }

    const data = await response.json();
    cachedToken = data.access_token;
    tokenExpiresAt = Date.now() + data.expires_in * 1000;

    console.log('IGDB access token acquired, expires in', Math.round(data.expires_in / 3600), 'hours');
    return cachedToken;
}

/**
 * Make a POST request to an IGDB endpoint with an Apicalypse query body.
 */
async function igdbRequest(endpoint, body) {
    const token = await getAccessToken();

    const response = await fetch(`${IGDB_BASE_URL}/${endpoint}`, {
        method: 'POST',
        headers: {
            'Client-ID': TWITCH_CLIENT_ID,
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'text/plain',
        },
        body,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`IGDB API error (${endpoint}): ${response.status} - ${errorText}`);
    }

    return response.json();
}

/**
 * Build a full IGDB image URL from an image_id.
 * @param {string} imageId - The image_id from IGDB (e.g., "co1wyy")
 * @param {string} size - Image size preset (default: "t_screenshot_big" = 889x500)
 */
export function igdbImageUrl(imageId, size = 't_screenshot_big') {
    if (!imageId) return null;
    return `${IGDB_IMAGE_BASE}/${size}/${imageId}.jpg`;
}

/**
 * Search IGDB for a game by name and return the best match.
 */
export async function searchIGDBByName(name) {
    const body = `search "${name.replace(/"/g, '\\"')}";
fields id, name, cover.image_id, first_release_date;
limit 5;`;

    const results = await igdbRequest('games', body);

    if (!results || results.length === 0) return null;

    // Try exact match first, then best match
    const exactMatch = results.find(
        (g) => g.name.toLowerCase() === name.toLowerCase()
    );
    return exactMatch || results[0];
}

/**
 * Fetch detailed game profile from IGDB by IGDB ID.
 * Returns screenshots, artworks, storyline, videos, similar games, themes, game modes, etc.
 */
export async function fetchIGDBGameDetails(igdbId) {
    const body = `fields name, storyline, summary,
    screenshots.image_id, screenshots.width, screenshots.height,
    artworks.image_id, artworks.width, artworks.height,
    videos.name, videos.video_id,
    similar_games.name, similar_games.cover.image_id, similar_games.first_release_date,
    themes.name,
    game_modes.name,
    age_ratings.category, age_ratings.rating,
    involved_companies.company.name, involved_companies.developer, involved_companies.publisher,
    cover.image_id,
    first_release_date,
    total_rating, total_rating_count,
    genres.name,
    platforms.name,
    websites.category, websites.url;
where id = ${igdbId};
limit 1;`;

    const results = await igdbRequest('games', body);
    if (!results || results.length === 0) return null;

    const game = results[0];

    // Transform screenshots to full URLs
    const screenshots = (game.screenshots || []).map((s) => ({
        url: igdbImageUrl(s.image_id, 't_screenshot_big'),
        urlHD: igdbImageUrl(s.image_id, 't_1080p'),
        width: s.width,
        height: s.height,
    }));

    // Transform artworks to full URLs
    const artworks = (game.artworks || []).map((a) => ({
        url: igdbImageUrl(a.image_id, 't_screenshot_big'),
        urlHD: igdbImageUrl(a.image_id, 't_1080p'),
        width: a.width,
        height: a.height,
    }));

    // Transform videos (YouTube IDs)
    const videos = (game.videos || []).map((v) => ({
        name: v.name,
        videoId: v.video_id,
        youtubeUrl: `https://www.youtube.com/watch?v=${v.video_id}`,
        embedUrl: `https://www.youtube.com/embed/${v.video_id}`,
    }));

    // Transform similar games
    const similarGames = (game.similar_games || []).map((sg) => ({
        igdbId: sg.id,
        name: sg.name,
        cover: sg.cover ? igdbImageUrl(sg.cover.image_id, 't_cover_big') : null,
        releaseDate: sg.first_release_date
            ? new Date(sg.first_release_date * 1000).toISOString()
            : null,
    }));

    // Extract themes and game modes as string arrays
    const themes = (game.themes || []).map((t) => t.name);
    const gameModes = (game.game_modes || []).map((gm) => gm.name);

    // Extract age ratings
    const ageRatings = (game.age_ratings || []).map((ar) => ({
        category: ar.category, // 1=ESRB, 2=PEGI, etc.
        rating: ar.rating,
    }));

    // Extract involved companies
    const companies = (game.involved_companies || []).map((ic) => ({
        name: ic.company?.name,
        developer: ic.developer || false,
        publisher: ic.publisher || false,
    }));

    // Extract websites
    const websites = (game.websites || []).map((w) => ({
        category: w.category, // 1=official, 13=steam, etc.
        url: w.url,
    }));

    return {
        igdbId: game.id,
        name: game.name,
        storyline: game.storyline || null,
        summary: game.summary || null,
        screenshots,
        artworks,
        videos,
        similarGames,
        themes,
        gameModes,
        ageRatings,
        companies,
        websites,
        cover: game.cover ? igdbImageUrl(game.cover.image_id, 't_cover_big') : null,
        totalRating: game.total_rating || null,
        totalRatingCount: game.total_rating_count || null,
    };
}

/**
 * Check if IGDB is configured and available.
 */
export function isIGDBConfigured() {
    return !!(TWITCH_CLIENT_ID && TWITCH_CLIENT_SECRET);
}
