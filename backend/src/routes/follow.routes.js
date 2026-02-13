import express from 'express';
import { follow, unfollow, getFollowers, getFollowing, checkFollowStatus, getSocialFeed } from '../controllers/follow.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

// GET /api/follow/feed — social feed (must be before /:userId to avoid conflict)
router.get('/feed', requireAuth, getSocialFeed);

// GET /api/follow/status/:userId — check if current user follows target
router.get('/status/:userId', requireAuth, checkFollowStatus);

// POST /api/follow/:userId — follow a user
router.post('/:userId', requireAuth, follow);

// DELETE /api/follow/:userId — unfollow a user
router.delete('/:userId', requireAuth, unfollow);

// GET /api/follow/:userId/followers — get followers (public)
router.get('/:userId/followers', getFollowers);

// GET /api/follow/:userId/following — get following (public)
router.get('/:userId/following', getFollowing);

export default router;
