import { RAWG_API_KEY } from '../config/env.js';

const GROQ_URL    = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL  = 'llama-3.3-70b-versatile';
const RAWG_BASE   = 'https://api.rawg.io/api';

// ─── Map quiz answers → RAWG query params ──────────────────────────────────

const GENRE_SLUGS = {
  action:    'action',
  rpg:       'role-playing-games-rpg',
  strategy:  'strategy',
  puzzle:    'puzzle',
  horror:    'action',          // RAWG puts horror under action
  sports:    'sports',
  shooter:   'shooter',
  adventure: 'adventure',
  simulation:'simulation',
  racing:    'racing',
  fighting:  'fighting',
};

const PLATFORM_IDS = {
  pc:               4,
  playstation:      18,
  xbox:             1,
  'nintendo switch':7,
  mobile:           21,
};

function mapGenre(genre) {
  const key = genre.toLowerCase().trim();
  return GENRE_SLUGS[key] || key;
}

function mapPlatform(platform) {
  const key = platform.toLowerCase().trim();
  for (const [name, id] of Object.entries(PLATFORM_IDS)) {
    if (key.includes(name)) return id;
  }
  return null;
}

// ─── Fetch a pool of real games from RAWG ──────────────────────────────────

async function fetchGamePool(answers) {
  if (!RAWG_API_KEY) throw new Error('RAWG_API_KEY is not configured.');

  const params = new URLSearchParams({
    key:       RAWG_API_KEY,
    page_size: 30,
    ordering:  '-rating',
  });

  const genre    = mapGenre(answers.genre);
  const platform = mapPlatform(answers.platform);

  if (genre)    params.append('genres',    genre);
  if (platform) params.append('platforms', String(platform));

  const res = await fetch(`${RAWG_BASE}/games?${params}`);
  if (!res.ok) throw new Error(`RAWG error ${res.status}`);

  const data  = await res.json();
  const games = (data.results || []).map((g) => ({
    rawgId:   g.id,
    title:    g.name,
    rating:   g.rating,
    released: g.released?.slice(0, 4) || 'N/A',
    genres:   (g.genres || []).map((x) => x.name).join(', '),
    platforms:(g.platforms || []).map((x) => x.platform.name).join(', '),
  }));

  return games;
}

// ─── Build prompt (games are embedded as the catalogue) ────────────────────

function buildPrompt(answers, gamePool) {
  const catalogue = gamePool
    .map((g) => `[ID:${g.rawgId}] ${g.title} (${g.released}) — Genres: ${g.genres} — Platforms: ${g.platforms} — Rating: ${g.rating}`)
    .join('\n');

  const streamerNote = answers.isStreamer
    ? 'The user is a content creator/streamer — favour games with strong streaming appeal, exciting moments, and active communities.'
    : 'The user plays purely for personal enjoyment.';

  return `You are an expert game recommendation assistant.

${streamerNote}

User preferences:
- Mood: ${answers.mood}
- Time available: ${answers.timeAvailable}
- Preferred genre: ${answers.genre}
- Play style: ${answers.playStyle}
- Platform: ${answers.platform}

You MUST choose exactly 3 games from the following catalogue. Do NOT invent games outside this list.

CATALOGUE:
${catalogue}

Return ONLY a valid JSON array of exactly 3 objects. No markdown, no extra text.
Use the exact rawgId from the catalogue. Each object:
[
  {
    "rawgId": 12345,
    "title": "Exact title from catalogue",
    "reason": "2-3 sentences explaining why this matches the user's mood, time, and play style.",
    "tags": ["tag1", "tag2", "tag3"],
    "streamFriendly": true,
    "matchScore": 95
  }
]`;
}

// ─── Call Groq ──────────────────────────────────────────────────────────────

async function callGroq(prompt) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY is not configured on the server.');

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model:      GROQ_MODEL,
      messages:   [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    if (res.status === 429) {
      let retryAfter = 30;
      try {
        const match = JSON.parse(body)?.error?.message?.match(/(\d+(\.\d+)?)\s*s/);
        if (match) retryAfter = Math.ceil(parseFloat(match[1]));
      } catch { /* ignore */ }
      const err = new Error(`Rate limit hit — AI is busy. Please wait ${retryAfter}s and try again.`);
      err.status = 429;
      err.retryAfter = retryAfter;
      throw err;
    }
    throw new Error(`Groq API error ${res.status}: ${body}`);
  }

  const data    = await res.json();
  const rawText = data?.choices?.[0]?.message?.content;
  if (!rawText) throw new Error('Empty response from Groq.');
  return rawText;
}

// ─── Main export ────────────────────────────────────────────────────────────

/**
 * Fetches real games from RAWG, asks Groq to pick 3, returns enriched list.
 */
export async function getRecommendations(answers) {
  // 1. Fetch real game pool from RAWG
  const gamePool = await fetchGamePool(answers);
  if (!gamePool.length) throw new Error('Could not fetch games from RAWG. Check RAWG_API_KEY.');

  // 2. Ask Groq to pick 3 from the pool
  const prompt  = buildPrompt(answers, gamePool);
  const rawText = await callGroq(prompt);

  // 3. Parse response
  const cleaned = rawText.replace(/```json|```/g, '').trim();

  let picks;
  try {
    picks = JSON.parse(cleaned);
  } catch {
    throw new Error(`Failed to parse Groq response: ${cleaned.slice(0, 200)}`);
  }

  // Unwrap if Groq returned { recommendations: [...] }
  if (!Array.isArray(picks)) {
    const arr = Object.values(picks).find((v) => Array.isArray(v));
    if (!arr) throw new Error('Groq returned an unexpected format.');
    picks = arr;
  }

  if (!picks.length) throw new Error('Groq returned an empty list.');

  // 4. Validate rawgIds against the pool (prevent hallucinations)
  const poolMap = new Map(gamePool.map((g) => [g.rawgId, g]));
  const validated = picks
    .filter((p) => poolMap.has(Number(p.rawgId)))
    .map((p) => {
      const poolGame = poolMap.get(Number(p.rawgId));
      return {
        rawgId:        Number(p.rawgId),
        title:         poolGame.title,   // use authoritative title from RAWG
        developer:     '',
        genre:         poolGame.genres,
        platforms:     poolGame.platforms,
        year:          Number(poolGame.released) || null,
        reason:        p.reason,
        tags:          Array.isArray(p.tags) ? p.tags : [],
        streamFriendly:Boolean(p.streamFriendly),
        matchScore:    Number(p.matchScore) || 80,
      };
    });

  // If Groq hallucinated IDs, fall back to first pool games
  const final = validated.length
    ? validated
    : gamePool.slice(0, 3).map((g) => ({
        rawgId:        g.rawgId,
        title:         g.title,
        developer:     '',
        genre:         g.genres,
        platforms:     g.platforms,
        year:          Number(g.released) || null,
        reason:        'Highly rated game matching your selected genre and platform.',
        tags:          [],
        streamFriendly:false,
        matchScore:    75,
      }));

  return final.slice(0, 3);
}
