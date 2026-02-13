import express from 'express';
import { getGameReviews, getUserReviews, createReview, likeReview, getReviewStats } from '../controllers/review.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = express.Router();

// GET /api/reviews/game/:gameId — get reviews for a game (public)
router.get('/game/:gameId', getGameReviews);

// GET /api/reviews/game/:gameId/stats — get review stats (public)
router.get('/game/:gameId/stats', getReviewStats);

// GET /api/reviews/user/:userId — get reviews by a user (public)
router.get('/user/:userId', getUserReviews);

// POST /api/reviews/game/:gameId — create/update review (protected)
router.post('/game/:gameId',
    requireAuth,
    validate({
        body: {
            content: { required: true, type: 'string', minLength: 10, maxLength: 5000 },
            rating: { required: false, type: 'number', min: 1, max: 10 },
        },
    }),
    createReview
);

// POST /api/reviews/:reviewId/like — like a review (protected)
router.post('/:reviewId/like', requireAuth, likeReview);

export default router;
