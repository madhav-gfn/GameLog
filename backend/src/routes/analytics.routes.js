import express from 'express';
import { getOverview, getGameStats, getGenreBreakdown } from '../controllers/analytics.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

// All analytics routes require authentication
router.use(requireAuth);

// GET /api/analytics/overview — combined analytics dashboard
router.get('/overview', getOverview);

// GET /api/analytics/games — game status stats
router.get('/games', getGameStats);

// GET /api/analytics/genres — genre breakdown
router.get('/genres', getGenreBreakdown);

export default router;
