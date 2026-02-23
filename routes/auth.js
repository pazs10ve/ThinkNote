import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

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

export default router;
