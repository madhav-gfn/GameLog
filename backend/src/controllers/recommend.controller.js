import { getRecommendations } from '../services/recommendation.service.js';

const REQUIRED_FIELDS = ['mood', 'timeAvailable', 'genre', 'playStyle', 'platform'];

/**
 * POST /api/recommend
 * Body: { answers: { mood, timeAvailable, genre, playStyle, platform, isStreamer } }
 */
export async function recommend(req, res) {
  try {
    const { answers } = req.body;

    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ error: 'Request body must include an "answers" object.' });
    }

    // Validate required string fields
    for (const field of REQUIRED_FIELDS) {
      if (!answers[field] || typeof answers[field] !== 'string' || !answers[field].trim()) {
        return res.status(400).json({ error: `Missing or invalid answer for: ${field}` });
      }
    }

    // Sanitize inputs
    const sanitized = {
      mood: answers.mood.trim().slice(0, 100),
      timeAvailable: answers.timeAvailable.trim().slice(0, 100),
      genre: answers.genre.trim().slice(0, 100),
      playStyle: answers.playStyle.trim().slice(0, 100),
      platform: answers.platform.trim().slice(0, 100),
      isStreamer: Boolean(answers.isStreamer),
    };

    const recommendations = await getRecommendations(sanitized);

    return res.json({ recommendations });
  } catch (err) {
    console.error('[recommend.controller] Error:', err.message);
    const statusCode = err.status || 500;
    return res.status(statusCode).json({
      error: err.message || 'Failed to generate recommendations.',
      retryAfter: err.retryAfter ?? null,
    });
  }
}
