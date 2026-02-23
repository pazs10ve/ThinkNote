import { Router } from 'express';
import * as adminController from '../controllers/adminController.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

router.use(requireAdmin);

router.get('/', adminController.dashboard);
router.get('/users', adminController.users);
router.post('/users/:id/suspend', adminController.toggleSuspend);
router.post('/users/:id/delete', adminController.deleteUser);
router.get('/posts', adminController.posts);
router.post('/posts/:id/delete', adminController.deletePost);

export default router;
