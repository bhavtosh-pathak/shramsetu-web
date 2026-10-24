import { Router } from 'express';
import { getMyProfile, updateMyProfile, listWorkers, getWorker } from '../controllers/profileController.js';
import { protect, allowRoles } from '../middleware/auth.js';

const router = Router();
router.get('/me', protect, getMyProfile);
router.patch('/me', protect, updateMyProfile);
router.get('/workers', protect, allowRoles('hirer'), listWorkers);
router.get('/workers/:id', protect, allowRoles('hirer'), getWorker);
export default router;
