// backend/routes/authRoutes.js
const express = require('express');
const passport = require('passport');
const { getMe, googleCallback, logout } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Google OAuth routes
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { 
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=google_auth_failed` 
  }),
  googleCallback
);

// Protected routes
router.get('/me', protect, getMe);
router.get('/logout', logout);

module.exports = router;