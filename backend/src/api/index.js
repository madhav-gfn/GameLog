import express from 'express';
import gamesRouter from '../Routers/gamesRouter.js';
import userRoutes from '../routes/userRoutes.js';
import commentRoutes from '../routes/commentRoutes.js';
import authRoutes from '../routes/authRoutes.js';

const router = express.Router();

// Register routes
router.use('/auth', authRoutes);
router.use('/games', gamesRouter);
router.use('/users', userRoutes);
router.use('/comments', commentRoutes);

export { router as apiRoutes };
