import cors from 'cors';
import { FRONTEND_URL } from '../config/env.js';

const whitelist = [
    FRONTEND_URL,
    'http://localhost:5173',
    'http://localhost:3000'
].filter(Boolean);

const corsMiddleware = cors({
    origin: function (origin, callback) {
        if (!origin || whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
});

export default corsMiddleware;
