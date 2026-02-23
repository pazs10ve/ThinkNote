import { Router } from 'express';
import passport from 'passport';
import * as authController from '../controllers/authController.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { oauthCallback } from '../config/passport.js';

const router = Router();

// ── Email/password auth ───────────────────────────
router.get('/register', authController.showRegister);
router.post('/register', authLimiter, authController.register);
router.get('/login', authController.showLogin);
router.post('/login', authLimiter, authController.login);
router.get('/logout', authController.logout);
router.get('/verify/:token', authController.verifyEmail);
router.get('/forgot-password', authController.showForgotPassword);
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.get('/reset-password/:token', authController.showResetPassword);
router.post('/reset-password/:token', authLimiter, authController.resetPassword);

// ── Google OAuth ──────────────────────────────────
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/auth/login?error=oauth' }),
  (req, res) => oauthCallback(req, res, req.user)
);

// ── GitHub OAuth ──────────────────────────────────
router.get('/github',
  passport.authenticate('github', { scope: ['user:email'], session: false })
);
router.get('/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: '/auth/login?error=oauth' }),
  (req, res) => oauthCallback(req, res, req.user)
);

export default router;
