import express from 'express';
import { getUserProfile, getUserLibrary, updateProfile, getUserStats } from '../controllers/user.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { optionalAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = express.Router();

// PUT /api/users/profile - Update own profile (protected)
router.put('/profile',
    requireAuth,
    validate({
        body: {
            displayName: { required: false, type: 'string', minLength: 2, maxLength: 50 },
            bio: { required: false, type: 'string', maxLength: 500 },
            avatar: { required: false, type: 'string' },
            platformsPlayed: { required: false, type: 'array' },
            isPublic: { required: false, type: 'boolean' },
        },
    }),
    updateProfile
);

// GET /api/users/:id - Get user profile
router.get('/:id', optionalAuth, getUserProfile);

// GET /api/users/:id/library - Get user library
router.get('/:id/library', optionalAuth, getUserLibrary);

// GET /api/users/:id/stats - Get user stats
router.get('/:id/stats', optionalAuth, getUserStats);

export default router;