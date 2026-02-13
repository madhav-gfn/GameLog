import session from 'express-session';
import { SESSION_SECRET } from '../config/env.js';

const sessionMiddleware = session({
    secret: SESSION_SECRET || 'fallback-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 },
});

export default sessionMiddleware;
