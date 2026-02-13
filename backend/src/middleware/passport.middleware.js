import passport from 'passport';
import '../config/passport.js';

export const passportInit = passport.initialize();
export const passportSession = passport.session();
