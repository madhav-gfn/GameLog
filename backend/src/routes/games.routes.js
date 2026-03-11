import express from 'express';
import {
    getGames,
    getGameDetails,
    addGameToLibrary,
    updateGameInLibrary,
    removeGameFromLibrary,
    getUserGameLog,
    getGenres,
    getPlatforms,
} from '../controllers/games.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

// GET /api/games - Get games with filters (RAWG-powered)
router.get('/', getGames);

// GET /api/games/genres - Get available genres
router.get('/genres', getGenres);

// GET /api/games/platforms - Get available platforms
router.get('/platforms', getPlatforms);

// GET /api/games/:id - Get game details
router.get('/:id', getGameDetails);

// GET /api/games/:gameId/library - Get user's log for a specific game (protected)
router.get('/:gameId/library', requireAuth, getUserGameLog);

// POST /api/games/:gameId/library - Add game to user library (protected)
router.post('/:gameId/library', requireAuth, addGameToLibrary);

// PUT /api/games/:gameId/library - Update game log entry (protected)
router.put('/:gameId/library', requireAuth, updateGameInLibrary);

// DELETE /api/games/:gameId/library - Remove game from library (protected)
router.delete('/:gameId/library', requireAuth, removeGameFromLibrary);

export default router;
