import express from 'express';
import { getGames, getGameDetails, addGameToLibrary, getGenres, getPlatforms } from '../controllers/games.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

// GET /api/games - Get games with filters
router.get('/', getGames);

// GET /api/games/genres - Get available genres
router.get('/genres', getGenres);

// GET /api/games/platforms - Get available platforms
router.get('/platforms', getPlatforms);

// GET /api/games/:id - Get game details
router.get('/:id', getGameDetails);

// POST /api/games/:gameId/library - Add game to user library (protected)
router.post('/:gameId/library', requireAuth, addGameToLibrary);

export default router;
