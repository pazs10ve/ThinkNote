import { Router } from 'express';
import * as feedController from '../controllers/feedController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', feedController.globalFeed);
router.get('/feed', requireAuth, feedController.followingFeed);

export default router;
