import express from 'express';
import {
    getGameReviews,
    getUserReviews,
    createReview,
    likeReview,
    unlikeReview,
    getReviewStats,
    createReviewComment,
    getReviewComments,
} from '../controllers/review.controller.js';
import { requireAuth, optionalAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = express.Router();

// GET /api/reviews/game/:gameId - get reviews for a game (public)
router.get('/game/:gameId', optionalAuth, getGameReviews);

// GET /api/reviews/game/:gameId/stats - get review stats (public)
router.get('/game/:gameId/stats', getReviewStats);

// GET /api/reviews/user/:userId - get reviews by a user (public)
router.get('/user/:userId', optionalAuth, getUserReviews);

// POST /api/reviews/game/:gameId - create/update review (protected)
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


// GET /api/reviews/:reviewId/comments - get comments for a review (public)
router.get('/:reviewId/comments', getReviewComments);

// POST /api/reviews/:reviewId/comments - create a comment (protected)
router.post('/:reviewId/comments',
    requireAuth,
    validate({
        body: {
            content: { required: true, type: 'string', minLength: 1, maxLength: 2000 },
        },
    }),
    createReviewComment
);

// POST /api/reviews/:reviewId/like - like a review (protected)
router.post('/:reviewId/like', requireAuth, likeReview);

// DELETE /api/reviews/:reviewId/like - unlike a review (protected)
router.delete('/:reviewId/like', requireAuth, unlikeReview);

export default router;
