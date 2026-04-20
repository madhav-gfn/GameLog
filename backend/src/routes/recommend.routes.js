import express from 'express';
import { recommend } from '../controllers/recommend.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

// POST /api/recommend
// Expects: { answers: { mood, timeAvailable, genre, playStyle, platform, isStreamer } }
router.post('/', requireAuth, recommend);

export default router;
