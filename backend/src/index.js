// Load environment variables
import { PORT } from './config/env.js';
import express from 'express';
import prisma from './config/database.js';
import { apiRoutes } from './api/index.js';

// Middleware imports
import corsMiddleware from './middleware/cors.middleware.js';
import sessionMiddleware from './middleware/session.middleware.js';
import { passportInit, passportSession } from './middleware/passport.middleware.js';
import errorMiddleware from './middleware/error.middleware.js';

const app = express();

// Middleware
app.use(corsMiddleware);
app.use(express.json());
app.use(sessionMiddleware);
app.use(passportInit);
app.use(passportSession);

// Database connection test
prisma.$connect()
  .then(() => console.log('Database connected successfully'))
  .catch((error) => console.error('Database connection failed:', error));

// Routes
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling middleware (must be last)
app.use(errorMiddleware);

app.listen(PORT || 5000, () => {
  console.log(`Server running on port ${PORT || 5000}`);
});

export default app;
