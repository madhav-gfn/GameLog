import { config } from 'dotenv';
// Fallback to standard .env
config({ path: '.env' });

export const {
    PORT,
    NODE_ENV,
    DATABASE_URL,
    JWT_SECRET,
    JWT_EXPIRES_IN,
    RAWG_API_KEY,
    TWITCH_CLIENT_ID,
    TWITCH_CLIENT_SECRET,
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    SESSION_SECRET,
    FRONTEND_URL,
} = process.env;
