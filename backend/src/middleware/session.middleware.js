import session from 'express-session';
import connectPg from 'connect-pg-simple';
import { SESSION_SECRET } from '../config/env.js';

const PgStore = connectPg(session);

const sessionMiddleware = session({
    secret: SESSION_SECRET || 'fallback-secret',
    resave: false,
    saveUninitialized: false,
    store: new PgStore({
        conString: process.env.DATABASE_URL,
        tableName: 'session',
        createTableIfMissing: true,
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000,
    },
});

export default sessionMiddleware;
