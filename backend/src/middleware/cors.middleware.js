import cors from 'cors';
import { FRONTEND_URL } from '../config/env.js';

const corsMiddleware = cors({
    origin: FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
});

export default corsMiddleware;
