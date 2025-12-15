import express from 'express';
import passport from 'passport';

const router = express.Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/login` }),
  (req, res) => res.redirect(process.env.FRONTEND_URL)
);

router.post('/logout', (req, res) => {
  req.logout(() => res.json({ success: true }));
});

router.get('/me', (req, res) => {
  res.json(req.user || null);
});

export default router;