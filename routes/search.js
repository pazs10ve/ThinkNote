import { Router } from 'express';
import * as searchController from '../controllers/searchController.js';

const router = Router();

router.get('/search', searchController.search);
router.get('/explore', searchController.explore);

export default router;
