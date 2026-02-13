import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';
import { JWT_SECRET } from '../config/env.js';

// Supports both JWT (Bearer token) and session-based (Google OAuth) auth
export const requireAuth = async (req, res, next) => {
  try {
    // 1. Check for JWT token in Authorization header
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          username: true,
          email: true,
          displayName: true,
          avatar: true,
          bio: true,
          createdAt: true,
        },
      });

      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      req.user = user;
      return next();
    }

    // 2. Fall back to session-based auth (Google OAuth)
    if (req.user) {
      return next();
    }

    return res.status(401).json({ error: 'Unauthorized' });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    next(error);
  }
};