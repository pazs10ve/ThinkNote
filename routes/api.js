import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimiter.js';
import * as apiController from '../controllers/apiController.js';

const router = Router();

router.use(apiLimiter);

// Likes & Bookmarks
router.post('/posts/:id/like', requireAuth, apiController.toggleLike);
router.post('/posts/:id/bookmark', requireAuth, apiController.toggleBookmark);
router.post('/posts/:id/view', apiController.incrementView);

// Follow
router.post('/users/:username/follow', requireAuth, apiController.toggleFollow);

// Comments
router.get('/posts/:postId/comments', apiController.getComments);
router.post('/posts/:postId/comments', requireAuth, apiController.addComment);
router.delete('/comments/:commentId', requireAuth, apiController.deleteComment);

// Notifications
router.get('/notifications', requireAuth, apiController.getNotifications);
router.post('/notifications/read-all', requireAuth, apiController.markAllRead);
router.post('/notifications/:id/read', requireAuth, apiController.markOneRead);

export default router;
