import express from 'express';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { FRONTEND_URL, JWT_SECRET, JWT_EXPIRES_IN } from '../config/env.js';
import { signup, signin, signout } from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

// JWT Auth Routes
router.post('/signup',
  validate({
    body: {
      username: {
        required: true,
        type: 'string',
        minLength: 3,
        maxLength: 20,
        pattern: /^[a-zA-Z0-9_]+$/,
        patternMessage: 'Username can only contain letters, numbers, and underscores',
      },
      email: {
        required: true,
        type: 'string',
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        patternMessage: 'Please provide a valid email address',
      },
      password: {
        required: true,
        type: 'string',
        minLength: 8,
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
        patternMessage: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      },
      displayName: {
        required: false,
        type: 'string',
        minLength: 2,
        maxLength: 50,
      },
    },
  }),
  signup
);

router.post('/signin',
  validate({
    body: {
      email: { required: true, type: 'string' },
      password: { required: true, type: 'string' },
    },
  }),
  signin
);

router.post('/signout', signout);

// Google OAuth Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${FRONTEND_URL}/login?error=google_auth_failed` }),
  (req, res) => {
    // Generate a JWT token for the Google-authenticated user
    const token = jwt.sign({ userId: req.user.id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    // Remove sensitive fields before encoding user data
    const { passwordHash, ...safeUser } = req.user;

    // Redirect to frontend with token in query params
    const userParam = encodeURIComponent(JSON.stringify(safeUser));
    res.redirect(`${FRONTEND_URL}?token=${token}&user=${userParam}`);
  }
);

// Legacy logout (for Google OAuth sessions)
router.post('/logout', (req, res) => {
  req.logout(() => res.json({ success: true }));
});

// Get current user (works with both JWT and session)
router.get('/me', requireAuth, (req, res) => {
  res.json(req.user || null);
});

export default router;