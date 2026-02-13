import express from 'express';
import { getUserProfile, getUserLibrary, getUserActivity } from '../controllers/user.controller.js';

const router = express.Router();

// GET /api/users/:id - Get user profile
router.get('/:id', getUserProfile);

// GET /api/users/:id/library - Get user library
router.get('/:id/library', getUserLibrary);

// GET /api/users/:id/activity - Get user activity
router.get('/:id/activity', getUserActivity);

export default router;