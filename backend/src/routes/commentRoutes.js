import express from 'express';
import { getGameComments, addComment } from '../controllers/commentsController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/comments/game/:gameId - Get comments for a game
router.get('/game/:gameId', getGameComments);

// POST /api/comments/game/:gameId - Add comment to game (protected)
router.post('/game/:gameId', requireAuth, addComment);

export default router;