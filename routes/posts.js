import { Router } from 'express';
import * as postController from '../controllers/postController.js';
import { requireAuth } from '../middleware/auth.js';
import upload from '../middleware/uploadMiddleware.js';

const router = Router();

router.get('/new-post', requireAuth, postController.showCreate);
router.post('/posts', requireAuth, upload.single('coverImage'), postController.create);
router.get('/post/:slug', postController.detail);
router.get('/posts/:id/edit', requireAuth, postController.showEdit);
router.post('/posts/:id', requireAuth, upload.single('coverImage'), postController.update);
router.post('/posts/:id/delete', requireAuth, postController.delete);
router.get('/bookmarks', requireAuth, postController.bookmarks);

export default router;
