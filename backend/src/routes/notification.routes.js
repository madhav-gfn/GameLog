import express from 'express';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notification.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

// All notification routes require authentication
router.use(requireAuth);

// GET /api/notifications - Get user's notifications
router.get('/', getNotifications);

// PUT /api/notifications/read-all - Mark all as read
router.put('/read-all', markAllAsRead);

// PUT /api/notifications/:id/read - Mark single notification as read
router.put('/:id/read', markAsRead);

export default router;
