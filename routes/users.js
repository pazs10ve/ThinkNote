import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import { requireAuth } from '../middleware/auth.js';
import upload from '../middleware/uploadMiddleware.js';

const router = Router();

router.get('/u/:username', userController.profile);
router.get('/u/:username/followers', userController.followers);
router.get('/u/:username/following', userController.following);
router.get('/settings', requireAuth, userController.showSettings);
router.post('/settings', requireAuth, userController.updateSettings);
router.post('/settings/avatar', requireAuth, upload.single('avatar'), userController.updateAvatar);

export default router;
