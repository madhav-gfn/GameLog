import express from 'express';
import gamesRouter from '../routes/games.routes.js';
import userRoutes from '../routes/user.routes.js';
import commentRoutes from '../routes/comment.routes.js';
import authRoutes from '../routes/auth.routes.js';
import followRoutes from '../routes/follow.routes.js';
import analyticsRoutes from '../routes/analytics.routes.js';
import listRoutes from '../routes/list.routes.js';
import reviewRoutes from '../routes/review.routes.js';

const router = express.Router();

// Register routes
router.use('/auth', authRoutes);
router.use('/games', gamesRouter);
router.use('/users', userRoutes);
router.use('/comments', commentRoutes);
router.use('/follow', followRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/lists', listRoutes);
router.use('/reviews', reviewRoutes);

export { router as apiRoutes };
