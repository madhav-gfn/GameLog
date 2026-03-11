import express from 'express';
import { search, getTrending, getPopularLists, getFriendPlayed } from '../controllers/search.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

// GET /api/search?q=&type=games|users|all - Unified search (public)
router.get('/', search);

// GET /api/discover/trending - Trending games (public)
router.get('/discover/trending', getTrending);

// GET /api/discover/popular-lists - Popular public lists (public)
router.get('/discover/popular-lists', getPopularLists);

// GET /api/discover/friend-played - Games played by friends (protected)
router.get('/discover/friend-played', requireAuth, getFriendPlayed);

export default router;
